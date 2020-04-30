import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
const logger = createLogger('generateUploadUrl')

const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const gamesTable = process.env.SGL_TABLE
const gamesIndex = process.env.SGL_INDEX
const bucketName = process.env.SGL_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const gameId = event.pathParameters.gameId
  const userId = getUserId(event)
  logger.info({userId: userId, gameId: gameId})

  try{
    logger.info('Updating game with attachment')
    await gameUpdate(userId, gameId)
    logger.info('Updated game with attachment')

    logger.info('Getting upload url')
    const url = getUploadUrl(gameId)
    logger.info('Got upload url')

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: url
      })
    }
  } catch(e) {
    logger.error('Error getting upload url', {error: e.message})
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Error getting upload url'
      })
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)

async function gameUpdate(userId: string, gameId: string) {
  const result = await docClient.query({
    TableName: gamesTable,
    IndexName: gamesIndex,
    KeyConditionExpression: 'userId = :userId and gameId = :gameId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':gameId': gameId
    }
  })
  .promise()
  if(result.Count === 0){
    throw new Error('Invalid gameId')
  }

  const gameItem = result.Items[0]

  logger.info('Updating game', {gameId: gameId})

  await docClient.update({
    TableName: gamesTable,
    Key:{
      "userId": gameItem.userId,
      "createdAt": gameItem.createdAt
    },
    UpdateExpression: "set attachmentUrl=:attachmentUrl",
    ExpressionAttributeValues:{
        ":attachmentUrl":`https://${bucketName}.s3.amazonaws.com/${gameId}`,
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()
}

function getUploadUrl(gameId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: gameId,
    Expires: urlExpiration
  })
}