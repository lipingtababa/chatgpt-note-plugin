import Joi from 'joi'

export class Todo {
  id: number
  msg: string
  done: boolean

  constructor(id: number, msg: string, done: boolean) {
    this.id = id
    this.msg = msg
    this.done = done
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
  id: Joi.number().messages({
    'number.base': `"id" must be a number`
  }),
  msg: Joi.string().required(),
  done: Joi.boolean().required()
})
