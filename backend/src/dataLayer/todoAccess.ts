import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { AttachmentUtils } from '../helpers/attachmentUtils'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
const attachment = new AttachmentUtils()

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ){}

    async getAllTodos(): Promise<TodoItem[]> {

        const result = await this.docClient.query({
          TableName: this.todosTable
        }).promise()
    
        const items = result.Items
        return items as TodoItem[]
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos function called')

        const result = await this.docClient
        .query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
        .promise()

        const items = result.Items
        return items as TodoItem[] 
    }
    // Create todo
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating todo item function called')
        const result = await this.docClient
        .put({
            TableName: this.todosTable,
            Item: todoItem
        })
        .promise()
        logger.info('Todo item created', result)
        return todoItem as TodoItem
    }
    // Delete todo
    async deleteTodo(userId:string, todoId: string): Promise<boolean> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
              "userId": userId,
              "todoId": todoId
            },
          }).promise()
        return true
    }
    // Update todo
    async updateTodo(todoId: string, userId: string, updateTodoRequest:UpdateTodoRequest){
        let expressionAttibutes = {
        ":done": updateTodoRequest.done,
        ":name": updateTodoRequest.name,
        ":dueDate": updateTodoRequest.dueDate
        }
        let updateExpression = "set done = :done, dueDate= :dueDate, #n= :name"      

        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            "userId": userId,
            "todoId": todoId
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttibutes,
          ExpressionAttributeNames:{
            "#n": "name"
          }
        }).promise()
    }
    // Upload Image
    async updateTodoAttachmentUrl(userId: string, todoId: string) {
        logger.info('Updating todo attachment url')        
        const s3AttachmentUrl = attachment.getAttachmentUrl(todoId)
        const dbTodoTable = process.env.TODOS_TABLE
        const params = {
          TableName: dbTodoTable,
          Key: {
            userId,
            todoId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': s3AttachmentUrl
          },
          ReturnValues: 'UPDATED_NEW'
        }
        logger.info('--Param ne--', params)
        await this.docClient.update(params).promise()
    }
    
    // Search Todo
    async searchTodo(key: string, userId: string): Promise<TodoItem[]> {      
      const params = {
        TableName: this.todosTable,
        FilterExpression: 'contains(#key, :task_name)',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeNames: {
          '#key': 'name'
        },
        ExpressionAttributeValues: {
          ':task_name': key,
          ':userId': userId
        }
      }
      const data = await this.docClient.query(params).promise()
      return data.Items as TodoItem[]         
    }  
  }