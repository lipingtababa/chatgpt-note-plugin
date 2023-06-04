import { get } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Todo, TodoError, TodoSchema } from './types'
import { getTodosFromStorage, saveTodosToStorage } from './storageS3'
import { normalizeId } from './utils'
import { valid } from 'joi'

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

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    let data = await getTodosFromStorage(normalizeId(req.query))
    res.status(200).json(data)
  } catch (error) {
    console.error('Error:', error)
    res.status(error instanceof TodoError ? error.statusCode : 500).json(error)
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const targetId = normalizeId(req.query)
    const { error } = TodoSchema.validate(req.body)
    if (error) {
      console.error('Error:', error)
      throw new TodoError(error.message, 400)
    }
    // if id is provided in the body, it must match the query.id
    if (req.body.id && req.body.id != targetId) {
      throw new TodoError('Unmatched query.id and body.id', 400)
    }

    const data = await getTodosFromStorage(null)

    // update todo in the list
    const updatedData = data.map((todo) => {
      if (todo.id === targetId) {
        return req.body
      }
      return todo
    })

    saveTodosToStorage(updatedData)

    res.status(200).json(updatedData)
  } catch (error) {
    console.error('Error:', error)
    res.status(error instanceof TodoError ? error.statusCode : 500).json(error)
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // validate and normalize the body
    const { error } = TodoSchema.validate(req.body)
    if (error) {
      console.error('Error:', error)
      throw new TodoError(error.message, 400)
    }

    const data = await getTodosFromStorage(null)

    // add new todo to the list with maxid + 1
    const maxID = data.reduce((max, todo) => Math.max(max, todo.id), 0)
    req.body.id = maxID + 1
    data.push(req.body)

    saveTodosToStorage(data)

    res.status(200).json(data || [])
  } catch (error) {
    console.error('Error:', error)
    res.status(error instanceof TodoError ? error.statusCode : 500).json(error)
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    // validate the request
    const targetId = normalizeId(req.query)

    const data = await getTodosFromStorage(null)
    const updatedData = data.filter((todo) => todo.id !== targetId)

    // save updated todo list to S3 and return to client
    await saveTodosToStorage(updatedData)

    res.status(200).json(updatedData || [])
  } catch (error) {
    console.error('Error:', error)
    res.status(error instanceof TodoError ? error.statusCode : 500).json(error)
  }
}
