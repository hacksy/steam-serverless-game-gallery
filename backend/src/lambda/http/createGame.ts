import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateGameRequest } from '../../requests/CreateGameRequest'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
import { createGame } from '../../businessLogic/games'
const logger = createLogger('createGame')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newGame: CreateGameRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  try{
    const newItem = await createGame(newGame, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  } catch(e) {
    logger.error('Error creating game', {error: e.message})
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
