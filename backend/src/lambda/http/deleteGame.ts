import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { deleteGame } from '../../businessLogic/games'
const logger = createLogger('deleteGame')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const gameId = event.pathParameters.gameId
  const userId = getUserId(event)

  logger.info({userId: userId, gameId: gameId})
  try{
    await deleteGame(userId, gameId)
    return {
      statusCode: 200,
      body: ''
    }
  } catch(e) {
    logger.error('Error deleting game', { error: e.message})
    return {
      statusCode: 400,
      body: ''
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
