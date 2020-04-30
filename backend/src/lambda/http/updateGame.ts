import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateGameRequest } from '../../requests/UpdateGameRequest'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { updateGame } from '../../businessLogic/games'
const logger = createLogger('updateGame')

export const handler = middy( async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Event', event)
  const gameId = event.pathParameters.gameId
  const updateGameRequest: UpdateGameRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  try{
    await updateGame(userId, gameId, updateGameRequest)
    return {
      statusCode: 200,
      body: ''
    }
  } catch(e) {
    logger.error('Error updating game', { error: e.message })
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
