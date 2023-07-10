import { FastifyInstance } from 'fastify'
import { ObjectId } from 'mongodb'

import validateProduct from '../product.validation'
import routeHandler from './product.create'

jest.mock('../product.validation')

describe('Product Route', () => {
  let fastify: FastifyInstance

  beforeAll(() => {
    fastify = mockFastifyInstance()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should save the product and return it', async () => {
    const collectionMock = {
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockedId' }),
      findOne: jest.fn().mockResolvedValue({ _id: 'mockedId', name: 'Test Product' }),
    }
    const requestMock = {
      db: {
        collection: jest.fn().mockReturnValue(collectionMock),
      },
      body: {
        name: 'Test Product',
        icon: 'product-icon',
        category: {
          _id: 'category-id!',
          name: 'Category Name',
          icon: 'category-icon',
        },
      },
    }
    const replyMock = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    jest.mocked(validateProduct).mockResolvedValue()

    await routeHandler.call(fastify, requestMock as any, replyMock as any)

    // Ensure that the request is properly processed
    expect(requestMock.db.collection).toHaveBeenCalledWith('products')
    expect(collectionMock.insertOne).toHaveBeenCalledWith({
      name: 'Test Product',
      icon: 'product-icon',
      categoryId: new ObjectId('category-id!'),
    })

    // Ensure that the response is correct
    expect(replyMock.code).toHaveBeenCalledWith(201)
    expect(replyMock.send).toHaveBeenCalledWith({ _id: 'mockedId', name: 'Test Product' })
  })

  test('should handle validation errors', async () => {
    const collectionMock = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
    }
    const requestMock = {
      db: {
        collection: jest.fn().mockReturnValue(collectionMock),
      },
      body: {
        name: 'Invalid Product',
        icon: 'product-icon',
        category: {
          _id: 'category-id',
          name: 'Category Name',
          icon: 'category-icon',
        },
      },
    }
    const replyMock = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    const validationError = { error: 'product.is.super.invalid', message: 'Product name is invalid' }
    jest.mocked(validateProduct).mockRejectedValue(validationError)

    await routeHandler.call(fastify, requestMock as any, replyMock as any)

    // Ensure that the database operations are not called
    expect(collectionMock.insertOne).not.toHaveBeenCalled()
    expect(collectionMock.findOne).not.toHaveBeenCalled()

    // Ensure that the response is correct
    expect(replyMock.code).toHaveBeenCalledWith(400)
    expect(replyMock.send).toHaveBeenCalledWith({ error: validationError.error, message: validationError.message })
  })
})

// Mock FastifyInstance
function mockFastifyInstance() {
  const fastify = {} as FastifyInstance

  return fastify
}
