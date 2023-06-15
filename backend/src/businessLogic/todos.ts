import { parseUserId } from '../auth/utils';
import { TodosAccess } from '../dataLayer/todoAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

//import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

export async function getUserTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken)
    return todosAccess.getTodos(userId)
}
// Create TODO
export const createTodo = async (
    newTodo: CreateTodoRequest,
    userId: string
): Promise<TodoItem> => {
    logger.info('Create todo function called')

    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    //const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        //attachmentUrl: s3AttachmentUrl,
        ...newTodo
    }
    return await todosAccess.createTodoItem(newItem)
}
// Delete Todo
export async function deleteTodo(userId: string, todoId: string): Promise<boolean> {
    return await todosAccess.deleteTodo(userId, todoId)
}
// Update Todo
export async function updateTodo(
    todoId: string,
    userId: string,
    updateTodoRequest: UpdateTodoRequest
){
    return await todosAccess.updateTodo(todoId, userId, updateTodoRequest)
}
// Upload Image
export async function createAttachmentUrl(
    userId: string,
    todoId: string
  ) {
    logger.info('Create attachment function called')
    todosAccess.updateTodoAttachmentUrl(userId, todoId)
    return attachmentUtils.getUploadUrl(todoId)
}

// Search Todo
export async function searchTodo(key: string, userId: string) {
    return await todosAccess.searchTodo(key, userId)
}