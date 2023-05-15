import { get } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next'
const AWS = require('aws-sdk')


class Todo {
  id: number;
  msg: string;
  done: boolean;

  constructor(id: number, msg: string, done: boolean) {
    this.id = id;
    this.msg = msg;
    this.done = done;
  }
}

class TodoError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region: 'us-east-1'
})

const params = {
  Bucket: process.env.TODOS_BUCKET ?? 'us-east-1-temp-ma',
  Key: process.env.TODOS_KEY ?? 'chatgpt-plugin/todo-list/todo-list.json'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // handle GET request
  if (req.method === 'GET') {
    return handleGet(req, res)
  }

  // handle POST request
  if (req.method === 'POST') {
    return handlePost(req, res)
  }

  // handle DELETE request
  if (req.method === 'DELETE') {
    return handleDelete(req, res)
  }

  // handle PUT request
  if (req.method === 'PUT') {
    return handlePut(req, res)
  }

  // handle other requests
  res
    .status(400)
    .json({ error: 'Only GET, POST, DELETE and PUT requests allowed' })
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let data = await getTodosFromStorage();

    // return all todos or a specific todo
    if (req.query?.id) {
      const targetID = Number(req.query.id)
      data = data.filter((todo) => todo.id === targetID)
    }
    res.status(200).json(data)
  } catch (error) {
    console.error('Error:', error)
    res.status( error instanceof TodoError ? error.statusCode : 500).json(error)
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse
  ) {
  try {
    const targetID = Number(req.query.id)
    // validate the body
    if (!req.body.id || !(req.body.id == targetID)) {
      throw new TodoError('Unmatched query.id and body.id', 400);
    }
    if (!req.body.msg) {
      throw new TodoError('msg is required', 400);
    }

    const data = await getTodosFromStorage();

    // update todo in the list
    const updatedData = data.map((todo) => {
      if (todo.id === targetID) {
        return req.body
      }
      return todo
    })

    saveTodosToStorage(updatedData)
    
    res.status(200).json(updatedData)
  } catch (error) {
    console.error('Error:', error)
    res.status( error instanceof TodoError ? error.statusCode : 500).json(error)
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse
  ) {
  try {
    // validate and normalize the body
    if (!req.body.msg) {
      throw new TodoError('msg is required', 400);
    }

    const data = await getTodosFromStorage();

    // add new todo to the list with maxid + 1
    const maxID = data.reduce((max, todo) => Math.max(max, todo.id), 0)
    req.body.id = maxID + 1
    data.push(req.body)

    saveTodosToStorage(data)
    
    res.status(200).json(data || [])
  } catch (error) {
    console.error('Error:', error)
    res.status( error instanceof TodoError ? error.statusCode : 500).json(error)
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse
  ) {
  try {
    // validate the request
    if (!req.query.id) {
      throw new TodoError('id is required', 400)
    }
    const targetID = Number(req.query.id)

    const data = await getTodosFromStorage();

    // remove todo from the list
    const updatedData = data.filter((todo) => todo.id !== targetID)

    // save updated todo list to S3 and return to client
    await saveTodosToStorage(updatedData)
    
    res.status(200).json(updatedData || [])
  } catch (error) {
    console.error('Error:', error)
    res.status( error instanceof TodoError ? error.statusCode : 500).json(error)
  }
}

async function getTodosFromStorage(): Promise<Todo[]> {
  const file = await s3.getObject(params).promise()
  const fileContent = file.Body.toString('utf-8')
  return JSON.parse(fileContent)
}

async function saveTodosToStorage(todos: Todo[]) {
  const uploadedParams = Object.assign({}, params, {
    Body: JSON.stringify(todos)
  })
  await s3.putObject(uploadedParams).promise()
}