import { Todo, TodoError } from './types'
import { s3Params, STORAGE_REGION } from './conf'
import AWS from 'aws-sdk'

const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region: STORAGE_REGION
})

async function getTodosFromStorage(id: number | null): Promise<Todo[]> {
  let data: Todo[] = []
  const file = await s3.getObject(s3Params).promise()
  if (!file.Body) {
    throw new TodoError('Error reading the DB', 500)
  }

  try {
    data = JSON.parse(file.Body?.toString('utf-8')) as any
  } catch (error) {
    console.error('Error:', error)
    throw new TodoError('Error parsing data from DB', 500)
  }

  return data.filter((todo: any) => !id || todo.id === id)
}

async function saveTodosToStorage(todos: Todo[]): Promise<Todo[]> {
  const uploadedParams = Object.assign({}, s3Params, {
    Body: JSON.stringify(todos)
  })
  await s3.putObject(uploadedParams).promise()
  return todos
}

export { getTodosFromStorage, saveTodosToStorage }
