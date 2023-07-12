
import { FastifyInstance } from 'fastify'
import { clearDatabase, startApp, stopApp } from '@tests/appWithMemoryDB'

describe('Product Read API Tests', () => {
  let fastify: FastifyInstance

  beforeAll(async () => (fastify = await startApp()))
  beforeEach(async () => (await clearDatabase()))
  afterAll(async () => await stopApp())

  test('should return the product and respond with 200', async () => {
    // add product to delete
    const { insertedId } = await fastify.db.collection('products').insertOne({ name: 'Product' })
    // call delete product EP
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/products/${insertedId}`,
    })
    // check if the EP resloves and the response is as expected
    expect(response.json()).toEqual(expect.objectContaining({ name: 'Product' }))
    expect(response.statusCode).toEqual(200)
  })

  test('should throw 404 when product dont exists', async () => {
    // call delete product EP
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/products/123456789012`,
    })
    // check if the EP response code is as expected
    expect(response.statusCode).toEqual(404)
  })
})
