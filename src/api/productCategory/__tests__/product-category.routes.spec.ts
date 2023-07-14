import { FastifyInstance } from 'fastify'
import { clearDatabase, startApp, stopApp } from '@tests/app.start'
import { ProductCategory } from '@/types'
import * as validateCategory from '../services/product-category.validation.service'
import { ObjectId } from 'mongodb'
import { ERROR_CODE, validationError } from '@/services/error.service'

// mock the available icons
jest.mock('@/icons.data', () => ['icon1', 'icon2', 'icon3'])

describe('Product Category API Tests', () => {
  let fastify: FastifyInstance
  const epUrl = '/api/categories'
  const collection = () => fastify.db.collection('categories')

  beforeAll(async () => (fastify = await startApp()))
  beforeEach(async () => (jest.clearAllMocks(), await clearDatabase()))
  afterAll(async () => await stopApp())

  describe(`Create Category [POST ${epUrl}]`, () => {
    test(`should save the product category and return it`, async () => {
      // define valid category data
      const category: Partial<ProductCategory> = {
        name: 'Test ProductCategory',
        icon: 'icon1',
      }
      const response = await fastify.inject({ method: 'POST', url: epUrl, payload: category })
      // check if the EP resloves and the response is as expected
      expect(response.json()).toEqual(expect.objectContaining(category))
      expect(response.statusCode).toEqual(201)
      // check if the data is correctly saved in DB
      const dbitem = await collection().findOne({ _id: new ObjectId(response.json()._id) })
      expect(dbitem).toEqual(expect.objectContaining(category))
    })

    test(`should throw an validation error when the validation fails`, async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: epUrl,
        payload: {}, // invalid data
      })
      // check if the EP resloves and the response is as expected
      expect(response.statusCode).toEqual(ERROR_CODE.VALIDATION)
    })

    test(`should trigger validation`, async () => {
      const validateSpy = jest.spyOn(validateCategory, 'default').mockImplementation()
      await fastify.inject({ method: 'POST', url: epUrl, payload: {} })
      expect(validateSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe(`Update Category [POST ${epUrl}/:id]`, () => {
    let categoryId: string
    beforeEach(async () => {
      // Create category to update
      const { insertedId } = await fastify.db.collection('categories').insertOne({ name: 'Test Category' })
      categoryId = insertedId.toString()
    })

    test(`should update the product category and return it`, async () => {
      const updatedCategory = { name: 'UPDATED CATEGORY!', icon: 'icon1' }
      const response = await fastify.inject({
        method: 'POST',
        url: `${epUrl}/${categoryId}`,
        payload: updatedCategory,
      })
      // check if the EP resloves and the response is as expected
      expect(response.json()).toEqual(expect.objectContaining(updatedCategory))
      expect(response.statusCode).toEqual(200)

      // check if the data is correctly updated in DB
      const dbCategory = await collection().findOne({ _id: new ObjectId(response.json()._id) })
      expect(dbCategory).toEqual(expect.objectContaining(updatedCategory))
    })

    test(`should throw an validation error when the validation fails`, async () => {
      const validateSpy = jest.spyOn(validateCategory, 'default').mockRejectedValue(validationError('VALIDATION_ERROR'))
      const response = await fastify.inject({
        method: 'POST',
        url: `${epUrl}/${categoryId}`,
        payload: {}, // invalid data
      })
      // check if the EP resloves and the response is as expected
      expect(response.json()).toEqual(expect.objectContaining({ error: 'VALIDATION_ERROR' }))
      expect(response.statusCode).toEqual(ERROR_CODE.VALIDATION)
      expect(validateSpy).toHaveBeenCalledTimes(1)
    })

    test(`should trigger validation`, async () => {
      const validateSpy = jest.spyOn(validateCategory, 'default').mockImplementation()
      await fastify.inject({ method: 'POST', url: `${epUrl}/${categoryId}`, payload: {} })
      expect(validateSpy).toHaveBeenCalledTimes(1)
    })

    test(`should throw 404 when the category does not exit`, async () => {
      const response = await fastify.inject({ method: 'POST', url: `${epUrl}/123456789012`, payload: {} })
      expect(response.statusCode).toEqual(ERROR_CODE.NOT_FOUND)
    })
  })

  describe(`Delete Category [DELETE ${epUrl}/:id]`, () => {
    let categoryId: string
    beforeEach(async () => {
      // Create category to delete
      const { insertedId } = await fastify.db.collection('categories').insertOne({ name: 'Test Category' })
      categoryId = insertedId.toString()
    })

    test('should delete the category and respond with 200', async () => {
      const response = await fastify.inject({
        method: 'DELETE',
        url: `${epUrl}/${categoryId}`,
      })
      expect(response.statusCode).toEqual(200)
      // check in db if the category was really deleted
      expect(await fastify.db.collection('categories').findOne({ _id: new ObjectId(categoryId) })).toBeNull()
    })

    test('should throw 404 when category does not exists', async () => {
      const response = await fastify.inject({
        method: 'DELETE',
        url: `${epUrl}/123456789012`,
      })
      expect(response.statusCode).toEqual(404)
    })
  })

  describe(`Read Category [GET ${epUrl}/:id]`, () => {
    let categoryId: string
    beforeEach(async () => {
      // Create category to delete
      const { insertedId } = await fastify.db.collection('categories').insertOne({ name: 'Test Category' })
      categoryId = insertedId.toString()
    })

    test('should return the category and respond with 200', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: `${epUrl}/${categoryId}`,
      })
      // check if the EP resloves and the response is as expected
      expect(response.json()).toEqual(expect.objectContaining({ name: 'Test Category' }))
      expect(response.statusCode).toEqual(200)
    })

    test('should throw 404 when category does not exists', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: `${epUrl}/123456789012`,
      })
      expect(response.statusCode).toEqual(404)
    })
  })

  describe(`List, Filter and Paginate Category [GET ${epUrl}]`, () => {
    const testData = {
      categories: [
        { name: 'Category A', icon: 'category-a-icon' },
        { name: 'Category C', icon: 'category-b-icon' },
        { name: 'Category K', icon: 'category-b-icon' },
        { name: 'Category F', icon: 'category-b-icon' },
        { name: 'Category J', icon: 'category-b-icon' },
        { name: 'Category G', icon: 'category-b-icon' },
        { name: 'Category D', icon: 'category-b-icon' },
        { name: 'Category E', icon: 'category-b-icon' },
        { name: 'Category B', icon: 'category-c-icon' },
        { name: 'Category H', icon: 'category-b-icon' },
        { name: 'Category I', icon: 'category-b-icon' },
      ],
    }

    beforeEach(async () => await fastify.db.collection('categories').insertMany(testData.categories))

    test('should return 10 categories ordered by name ascending when no URLSearchParams provided', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: epUrl,
      })
      expect(response.json().data.length).toEqual(10)
      expect(response.json().data[0].name).toEqual('Category A')
      expect(response.json().data[9].name).toEqual('Category J')
    })

    // test('should call the ProductCategory Database Service listItems with the passed URLSearchParams', async () => {})
  })
})
