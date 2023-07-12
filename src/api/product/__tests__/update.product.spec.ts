import { Product } from '@/types'
import { FastifyInstance } from 'fastify'
import { clearDatabase, startApp, stopApp } from '@tests/appWithMemoryDB'
import validateProduct from '../services/product.validation.service'

jest.mock('../services/product.validation.service')

describe('Product Update API Tests', () => {
  let fastify: FastifyInstance

  beforeAll(async () => (fastify = await startApp()))
  beforeEach(async () => (jest.clearAllMocks(), await clearDatabase()))
  afterAll(async () => await stopApp())

  test('should save the product and return it - with mocked validation', async () => {
    // create product with category
    const { insertedId: categoryId } = await fastify.db.collection('categories').insertOne({ name: 'Category'})
    const product = {
      name: 'Test Product',
      icon: 'icon1',
      categoryId,
    } as any
    const { insertedId } = await fastify.db.collection('products').insertOne(product)
    product.category = { _id: categoryId }
    product.name = 'New Product Name'
    product.icon = 'icon2'

    // let the validation resolve
    const validateMock = jest.mocked(validateProduct).mockResolvedValue()

    // call create product EP
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/products/${insertedId}`,
      payload: product,
    })

    // make sure the validation function has been called
    expect(validateMock).toHaveBeenCalledTimes(1)
    // check if the EP resloves and the response is as expected
    expect(response.json()).toEqual(expect.objectContaining({ name: 'New Product Name', icon: 'icon2' }))
    expect(response.statusCode).toEqual(200)
  })

  test('should throw an validation error when the validation fails', async () => {
    // define product data
    const product: Partial<Product> = { name: 'invalid-product!' }

    // let the validation reject
    jest.mocked(validateProduct).mockRejectedValue({ error: 'VALIDATION_ERROR' })

    // call create product EP
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/products',
      payload: product,
    })

    // check if the EP resloves and the response is as expected
    expect(response.json()).toEqual(expect.objectContaining({ error: 'VALIDATION_ERROR' }))
    expect(response.statusCode).toEqual(400)
  })

  test('should throw 404 when product dont exists', async () => {
    // call delete product EP
    const response = await fastify.inject({
      method: 'POST',
      url: `/api/products/123456789012`,
    })
    // check if the EP response code is as expected
    expect(response.statusCode).toEqual(404)
  })
})
