import Joi from 'joi'

export class Todo {
  id: number
  msg: string

  constructor(id: number, msg: string) {
    this.id = id
    this.msg = msg
  }
}

export class TodoError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

export const TodoSchema = Joi.object({
  id: Joi.number(),
  msg: Joi.string().required()
})

export const TodosSchema = Joi.array().items(TodoSchema)
