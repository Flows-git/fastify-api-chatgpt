import dotenv from 'dotenv'

import { Product } from '@/types'
import { FastifyInstance } from 'fastify'
import { clearDatabase, startApp, stopApp } from '@tests/app.start'
import validateProduct from '../services/product.validation.service'
import { ObjectId } from 'mongodb'
import { validationError } from '@/services/error.service'

// Load the environment variables from .env file
dotenv.config()
jest.mock('../services/product.validation.service')

describe('Product Create API Tests', () => {
  let fastify: FastifyInstance

  beforeAll(async () => (fastify = await startApp()))
  beforeEach(async () => (jest.clearAllMocks(), await clearDatabase()))
  afterAll(async () => await stopApp())

  test('should save the product and return it - with mocked validation', async () => {
    // define valid product data
    const product: Partial<Product> = {
      name: 'Test Product',
      icon: 'icon1',
      category: { _id: '123456789012' } as any,
    }

    // let the validation resolve
    const validateMock = jest.mocked(validateProduct).mockResolvedValue()

    // call create product EP
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/products',
      payload: product,
    })

    // make sure the validation function has been called
    expect(validateMock).toHaveBeenCalledTimes(1)
    // check if the EP resloves and the response is as expected
    expect(response.json()).toEqual(expect.objectContaining({ name: 'Test Product' }))
    expect(response.statusCode).toEqual(201)

    // check if the data is correctly saved in DB
    const createdProduct = await fastify.db.collection('products').findOne({ _id: new ObjectId(response.json()._id) })
    expect(createdProduct).toEqual(expect.objectContaining({ name: 'Test Product', icon: 'icon1', categoryId: new ObjectId('123456789012') }))
  })

  test('should throw an validation error when the validation fails', async () => {
    // define product data
    const product: Partial<Product> = { name: 'invalid-product!' }

    // let the validation reject
    jest.mocked(validateProduct).mockRejectedValue(validationError('VALIDATION_ERROR'))

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
})
