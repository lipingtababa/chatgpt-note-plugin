import mock from 'jest-mock-extended/lib/Mock'

import { S3 } from 'aws-sdk'
import { s3Params } from './conf'
import { getTodosFromStorage, saveTodosToStorage } from './storageS3'
import { Todo } from './types'
import { get } from 'http'
import { before } from 'node:test'

const todo1 = { id: 1, msg: 'write a unit test' }
const todo2 = { id: 2, msg: 'Buy milk' }
let mockedS3File = JSON.stringify([todo1, todo2])

const mockGetObject = jest.fn((param) => ({
  promise: jest.fn().mockResolvedValue({
    Body: mockedS3File
  })
}))

const mockPutObject = jest.fn((uploadedParams: any) => ({
  promise: jest.fn().mockImplementation(() => {
    mockedS3File = uploadedParams.Body
  })
}))

jest.mock('aws-sdk', () => {
  return {
    S3: jest.fn(() => ({
      getObject: (param: any) => mockGetObject(param),
      putObject: (param: any) => mockPutObject(param)
    }))
  }
})

describe('saveTodosToStorage', () => {
  it('Should save an array of todos to S3', async () => {
    const todos = [todo1, todo2]

    const ret = await saveTodosToStorage(todos)
    expect(ret).toEqual(todos)
    expect(mockPutObject).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: s3Params.Key,
        Body: JSON.stringify(todos)
      })
    )
  })
})

describe('getTodosFromStorage', () => {
  beforeEach(async () => {
    mockGetObject.mockClear()

    // To store the todos in mocked S3
    const todos = [todo1, todo2]
    await saveTodosToStorage(todos)
  })

  it('Should return todos that match the id', async () => {
    const todos = await getTodosFromStorage(1)
    expect(todos).toEqual([todo1])

    expect(mockGetObject).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: s3Params.Key
      })
    )
  })

  it('Should return all todos', async () => {
    const todos = await getTodosFromStorage(null)
    expect(todos).toEqual([todo1, todo2])

    expect(mockGetObject).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: s3Params.Key
      })
    )
  })

  it('Should return an empty list', async () => {
    mockedS3File = JSON.stringify([todo2, todo1])

    const todos = await getTodosFromStorage(3)
    expect(todos).toEqual([])

    expect(mockGetObject).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: s3Params.Key
      })
    )
  })
})
