import * as uuid from 'uuid'
import { GameItem } from "../models/GameItem"
import { SteamGameItem } from "../models/SteamGameItem"
import { SearchGameRequest } from '../requests/SearchGameRequest'
import { CreateGameRequest } from '../requests/CreateGameRequest'
import { asyncForEach } from '../utils/asyncForEach'
import { createLogger } from '../utils/logger'
import { GamesAccess } from '../dataLayer/gamesAccess'
import { UpdateGameRequest } from '../requests/UpdateGameRequest'
import Axios from 'axios'

const logger = createLogger('games')

const gamesAccess = new GamesAccess()

export async function createGame(
    createGameRequest: CreateGameRequest,
    userId: string
): Promise<GameItem> {

    const gameId = uuid.v4()
    logger.info('Creating game', {userId: userId, gameId: gameId, appId: createGameRequest.appId})

    return await gamesAccess.createGame({
        gameId: gameId,
        userId: userId,
        appId: createGameRequest.appId,
        name: createGameRequest.name,
        createdAt: new Date().toISOString(),
        wishlisted: false
    })
}


export async function fetchSteamGames() {

    logger.info('Start fetching games game')

    let response = await Axios.get("https://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json")
        logger.info('Number of games', {keys: response.data.applist.apps.length})
        asyncForEach(response.data.applist.apps, async(element)=>{
            let appId = element.appid as string
            let name = element.name as string
            logger.info('JSON HERE',{content: element})
             const newGame: SteamGameItem = {"appid":appId,"name":name}
             await gamesAccess.createSteamGame(
                 newGame
            )
          })
        

}

export async function deleteGame(userId: string, gameId: string){
    logger.info('Deleting Game', {userId: userId, gameId: gameId})
    return await gamesAccess.deleteGame(userId, gameId)
}

export async function getGames(userId: string){
    logger.info('Getting games for user ', {userId: userId})
    return await gamesAccess.getGames(userId)
}
export async function searchSteamGames(game: SearchGameRequest){
    logger.info('Searching for games', {name: game.name})
    return await gamesAccess.searchSteamGames(game.name)
}
export async function updateGame(
    userId: string,
    gameId: string,
    updatedGameRequest: UpdateGameRequest
  ) {
    logger.info('Updating game', {userId: userId, gameId: gameId})
    return await gamesAccess.updateGame(userId, gameId, updatedGameRequest)
  }