import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { GameItem } from '../models/GameItem'
import { SteamGameItem } from '../models/SteamGameItem'

import { createLogger } from '../utils/logger'
import { UpdateGameRequest } from '../requests/UpdateGameRequest'
const logger = createLogger('gamesAccess')

export class GamesAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly s3 = createS3Client(),
        private readonly gamesTable = process.env.SGL_TABLE,
        private readonly gamesIndex = process.env.SGL_INDEX,
        private readonly gamesListTable = process.env.APP_TABLE,
        //private readonly gamesListIndex = process.env.APP_INDEX,
        private readonly bucketName = process.env.SGL_S3_BUCKET
    ) { }

    async createGame(gameItem: GameItem): Promise<GameItem> {

        logger.info('Creating new Game', gameItem)

        await this.docClient.put({
            TableName: this.gamesTable,
            Item: gameItem
        }).promise()

        return gameItem as GameItem
    }
    async createSteamGame(steamGameItem: SteamGameItem): Promise<SteamGameItem> {

        logger.info('Creating new steam Game', steamGameItem)

        await this.docClient.put({
            TableName: this.gamesListTable,
            Item: steamGameItem
        }).promise()

        return steamGameItem as SteamGameItem
    }

    async deleteGame(userId: string, gameId: string) {
      const gameItem = await this.getGame(userId, gameId)

      if('attachmentUrl' in gameItem){
        logger.info('Deleting screenshot')
        await this.s3.deleteObject({
          Bucket: this.bucketName, 
          Key: gameId
        }).promise()
      }
    
      logger.info('Deleting game')
      await this.docClient.delete({
        TableName: this.gamesTable,
        Key:{
          "userId": gameItem.userId,
          "createdAt": gameItem.createdAt
        }
      }).promise()
    }

    async getGames(userId: string){
        const result = await this.docClient.query({
            TableName: this.gamesTable,
            IndexName: this.gamesIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
        .promise()
    
        return result.Items
    }
    async searchSteamGames(name: string){
        const result = await this.docClient.scan({
            TableName: this.gamesListTable,
            Limit: 5,
            FilterExpression: 'contains(#name, :name)',
            ExpressionAttributeValues: {
                ':name': name
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
        })
        .promise()
    
        return result.Items
    }
    async getGame(userId: string, gameId: string): Promise<GameItem>{
        const result = await this.docClient.query({
            TableName: this.gamesTable,
            IndexName: this.gamesIndex,
            KeyConditionExpression: 'userId = :userId and gameId = :gameId',
            ExpressionAttributeValues:{
                ':userId': userId,
                ':gameId': gameId
            }
        }).promise()
    
        if (result.Count === 0){
            logger.error('Game not found')
            throw new Error('Game not found')
        }
    
        return result.Items[0] as GameItem
    }

    async updateGame(userId: string, gameId: string, updatedGameRequest: UpdateGameRequest){    
        const gameItem = await this.getGame(userId, gameId)
    
        logger.info('Updating Game')
    
        await this.docClient.update({
            TableName: this.gamesTable,
            Key:{
                "userId": gameItem.userId,
                "createdAt": gameItem.createdAt
            },
            UpdateExpression: "set wishlisted=:wishlisted, #name=:name",
            ExpressionAttributeValues:{
                ":wishlisted":updatedGameRequest.wishlisted,
                ":name":updatedGameRequest.name,
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ReturnValues:"UPDATED_NEW"
        }).promise()
    }
}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient()
}

function createS3Client() {
    return new AWS.S3({
        signatureVersion: 'v4'
    })
}