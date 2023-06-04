import Joi from 'joi'
import { TodoError } from './types'

const schema = Joi.object({
  id: Joi.number().messages({
    'number.base': `"id" must be a number`
  })
})

export function normalizeId(query: any): number | null {
  // null is acceptable
  if (!query || !query.id) {
    return null
  }

  // Otherwise it must be a number
  const { error } = schema.validate(query)
  if (error) {
    console.error('Error:', error)
    throw new TodoError(error.message, 400)
  }

  return parseInt(query.id)
}
