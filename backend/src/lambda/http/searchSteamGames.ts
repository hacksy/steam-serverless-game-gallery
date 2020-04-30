import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
//import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { SearchGameRequest } from '../../requests/SearchGameRequest'

import { createLogger } from '../../utils/logger'
import { searchSteamGames } from '../../businessLogic/games'
const logger = createLogger('searchGame')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Caller event', event)
  const gameName: SearchGameRequest = JSON.parse(event.body)
  //const userId = getUserId(event)

  try{
    const games = await searchSteamGames(gameName)

    return {
      statusCode: 201,
      body: JSON.stringify({
        items: games
      })
    }
  } catch(e) {
    logger.error('Error searching games', { error: e.message})
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
