import { FastifyInstance } from 'fastify'
import { clearDatabase, startApp, stopApp } from '@tests/app.start'
import { Product, ProductCategory } from '@/types'
import * as validate from '../services/product.validation.service'
import { ObjectId, WithId } from 'mongodb'
import { ERROR_CODE, validationError } from '@/services/error.service'

// mock the available icons
jest.mock('@/icons.data', () => ['icon1', 'icon2', 'icon3'])

describe('Product Product API Tests', () => {
  let fastify: FastifyInstance
  const epUrl = '/api/products'
  const collection = () => fastify.db.collection('products')
  let category: WithId<ProductCategory>

  beforeAll(async () => (fastify = await startApp()))
  beforeEach(async () => {
    jest.clearAllMocks()
    await clearDatabase()
    const { insertedId: _id } = await fastify.db
      .collection('categories')
      .insertOne({ name: 'Product Category', icon: 'icon1' })
    category = { _id, name: 'Product Category', icon: 'icon1' }
  })
  afterAll(async () => await stopApp())

  describe(`Create Product [POST ${epUrl}]`, () => {
    test(`should save the product and return it`, async () => {
      const validateSpy = jest.spyOn(validate, 'default').mockImplementation()
      // define valid product data
      const product: Product = {
        name: 'Test Product',
        icon: 'icon1',
        category,
      }
      // call create product EP
      const response = await fastify.inject({ method: 'POST', url: epUrl, payload: product })

      expect(validateSpy).toHaveBeenCalled()
      // check if the EP resloves and the response is as expected
      expect(response.json()).toEqual({
        _id: expect.anything(),
        ...product,
        ...{ category: { ...category, ...{ _id: category._id.toString() } } },
      })
      expect(response.statusCode).toEqual(201)
      // check if the data is correctly saved in DB
      const createdProduct = await collection().findOne({ _id: new ObjectId(response.json()._id) })
      expect(createdProduct).toEqual({
        _id: expect.anything(),
        name: product.name,
        icon: product.icon,
        categoryId: category._id,
      })
    })

    test(`should throw an validation error when the validation fails`, async () => {
      const validateSpy = jest.spyOn(validate, 'default').mockRejectedValue(validationError('VALIDATION_ERROR'))
      // call create product EP
      const response = await fastify.inject({
        method: 'POST',
        url: epUrl,
        payload: {}, // invalid data
      })
      // check if the EP resloves and the response is as expected
      expect(response.statusCode).toEqual(ERROR_CODE.VALIDATION)
      expect(validateSpy).toHaveBeenCalled()
    })

    test(`should trigger validation`, async () => {
      const validateSpy = jest.spyOn(validate, 'default').mockImplementation()
      await fastify.inject({ method: 'POST', url: epUrl, payload: {} })
      expect(validateSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe(`Update Product [POST ${epUrl}/:id]`, () => {
    let itemId: string
    beforeEach(async () => {
      // Create product to update
      const { insertedId } = await collection().insertOne({ name: 'Test Product' })
      itemId = insertedId.toString()
    })

    test(`should update the product and return it`, async () => {
      const updatedProduct: Product = { name: 'UPDATED Product!', icon: 'icon2', category }
      const response = await fastify.inject({
        method: 'POST',
        url: `${epUrl}/${itemId}`,
        payload: updatedProduct,
      })
      console.log(response.json())
      console.log({
        ...updatedProduct,
        ...{ category: { ...category, ...{ _id: category._id.toString() } } },
      })
      // check if the EP resloves and the response is as expected
      expect(response.json()).toEqual({
        _id: expect.anything(),
        ...updatedProduct,
        ...{ category: { ...category, ...{ _id: category._id.toString() } } },
      })

      expect(response.statusCode).toEqual(200)

      // check if the data is correctly updated in DB
      const dbProduct = await collection().findOne({ _id: new ObjectId(response.json()._id) })
      expect(dbProduct).toEqual({
        _id: expect.anything(),
        name: updatedProduct.name,
        icon: updatedProduct.icon,
        categoryId: category._id,
      })
    })

    test(`should throw an validation error when the validation fails`, async () => {
      const validateSpy = jest.spyOn(validate, 'default').mockRejectedValue(validationError('VALIDATION_ERROR'))
      const response = await fastify.inject({
        method: 'POST',
        url: `${epUrl}/${itemId}`,
        payload: {}, // invalid data
      })
      // check if the EP resloves and the response is as expected
      expect(response.json()).toEqual(expect.objectContaining({ error: 'VALIDATION_ERROR' }))
      expect(response.statusCode).toEqual(ERROR_CODE.VALIDATION)
      expect(validateSpy).toHaveBeenCalledTimes(1)
    })

    test(`should trigger validation`, async () => {
      const validateSpy = jest.spyOn(validate, 'default').mockImplementation()
      await fastify.inject({ method: 'POST', url: `${epUrl}/${itemId}`, payload: {} })
      expect(validateSpy).toHaveBeenCalledTimes(1)
    })

    test(`should throw 404 when the product does not exit`, async () => {
      const response = await fastify.inject({ method: 'POST', url: `${epUrl}/123456789012`, payload: {} })
      expect(response.statusCode).toEqual(ERROR_CODE.NOT_FOUND)
    })
  })

  describe(`Delete Product [DELETE ${epUrl}/:id]`, () => {
    let itemId: string
    beforeEach(async () => {
      // Create product to delete
      const { insertedId } = await collection().insertOne({ name: 'Test Product' })
      itemId = insertedId.toString()
    })

    test('should delete the product and respond with 200', async () => {
      const response = await fastify.inject({
        method: 'DELETE',
        url: `${epUrl}/${itemId}`,
      })
      expect(response.statusCode).toEqual(200)
      // check in db if product was really deleted
      expect(await fastify.db.collection('products').findOne({ _id: new ObjectId(itemId) })).toBeNull()
    })

    test('should throw 404 when product does not exists', async () => {
      const response = await fastify.inject({
        method: 'DELETE',
        url: `${epUrl}/123456789012`,
      })
      expect(response.statusCode).toEqual(404)
    })
  })

  describe(`Read Product [GET ${epUrl}/:id]`, () => {
    let itemId: string
    beforeEach(async () => {
      // Create product to delete
      const { insertedId } = await fastify.db.collection('products').insertOne({ name: 'Test Product' })
      itemId = insertedId.toString()
    })

    test('should return the product and respond with 200', async () => {
      // call delete product EP
      const response = await fastify.inject({
        method: 'GET',
        url: `${epUrl}/${itemId}`,
      })
      // check if the EP resloves and the response is as expected
      expect(response.json()).toEqual({ _id: expect.anything(), name: 'Test Product' })
      expect(response.statusCode).toEqual(200)
    })

    test('should throw 404 when product does not exists', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: `${epUrl}/123456789012`,
      })
      expect(response.statusCode).toEqual(404)
    })
  })

  describe(`List, Filter and Paginate Product [GET ${epUrl}]`, () => {
    const testData = {
      products: [
        { name: 'Product A', icon: 'product-a-icon' },
        { name: 'Product C', icon: 'product-b-icon' },
        { name: 'Product K', icon: 'product-b-icon' },
        { name: 'Product F', icon: 'product-b-icon' },
        { name: 'Product J', icon: 'product-b-icon' },
        { name: 'Product G', icon: 'product-b-icon' },
        { name: 'Product D', icon: 'product-b-icon' },
        { name: 'Product E', icon: 'product-b-icon' },
        { name: 'Product B', icon: 'product-c-icon' },
        { name: 'Product H', icon: 'product-b-icon' },
        { name: 'Product I', icon: 'product-b-icon' },
      ],
    }

    beforeEach(async () => await collection().insertMany(testData.products))

    test('should return 10 products ordered by name ascending when no URLSearchParams provided', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: epUrl,
      })
      expect(response.json().data.length).toEqual(10)
      expect(response.json().data[0].name).toEqual('Product A')
      expect(response.json().data[9].name).toEqual('Product J')
    })

    // test('should call the Product Database Service listItems with the passed URLSearchParams', async () => {})
  })
})
