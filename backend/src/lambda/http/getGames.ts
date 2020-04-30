import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getGames } from '../../businessLogic/games'
const logger = createLogger('getGame')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Caller event', event)
  const userId = getUserId(event)

  try{
    const games = await getGames(userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        items: games
      })
    }
  } catch(e) {
    logger.error('Error getting game', { error: e.message})
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
