import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { fetchSteamGames } from '../../businessLogic/games'
const logger = createLogger('fetchSteamGames')

export const handler = middy(async (): Promise<APIGatewayProxyResult> => {
  //const newGame: CreateGameRequest = JSON.parse(event.body)
  //const userId = getUserId(event)

  try{
    const success = await fetchSteamGames()
    return {
      statusCode: 201,
      body: JSON.stringify({
        success: success
      })
    }
  } catch(e) {
    logger.error('Error fetching games', {error: e.message})
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
