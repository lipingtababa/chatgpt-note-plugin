import { normalizeId } from './utils'

describe('normalizeId', () => {
  it('Should return a number', async () => {
    const id = normalizeId({ id: '1' })
    expect(id).toEqual(1)
  })

  it('Should return a number', async () => {
    expect(() => normalizeId({ id: ['1', '2'] })).toThrowError(
      '"id" must be a number'
    )
  })

  it('Should return null', async () => {
    const id = normalizeId(null)
    expect(id).toEqual(null)
  })

  it('Should return null', async () => {
    const id = normalizeId({ not_a_id: '1' })
    expect(id).toEqual(null)
  })

  it('Should throw an error', async () => {
    expect(() => normalizeId({ id: 'abc' })).toThrowError(
      '"id" must be a number'
    )
  })
})
