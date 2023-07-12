import { FastifyInstance } from 'fastify'
import { startApp, stopApp } from '@tests/app.start'
import { ObjectId } from 'mongodb'

const testData = {
  categories: [
    { _id: new ObjectId('CategoryAAAA'), name: 'Category A', icon: 'category-a-icon' },
    { _id: new ObjectId('CategoryBBBB'), name: 'Category C', icon: 'category-c-icon' },
    { _id: new ObjectId('CategoryCCCC'), name: 'Category B', icon: 'category-b-icon' },
  ],
  products: [
    { _id: new ObjectId(110), name: 'Product J', categoryId: new ObjectId('CategoryAAAA') },
    { _id: new ObjectId(12), name: 'Product B', categoryId: new ObjectId('CategoryBBBB') },
    { _id: new ObjectId(18), name: 'Product H', categoryId: new ObjectId('CategoryBBBB') },
    { _id: new ObjectId(19), name: 'Product I', icon: 'product-i-icon', categoryId: new ObjectId('CategoryCCCC') },
    { _id: new ObjectId(15), name: 'Product E', categoryId: new ObjectId('CategoryBBBB') },
    { _id: new ObjectId(17), name: 'Product G', categoryId: new ObjectId('CategoryAAAA') },
    { _id: new ObjectId(14), name: 'Product D', categoryId: new ObjectId('CategoryAAAA') },
    { _id: new ObjectId(11), name: 'Product A', icon: 'product-a-icon', categoryId: new ObjectId('CategoryAAAA') },
    { _id: new ObjectId(16), name: 'Product F', categoryId: new ObjectId('CategoryCCCC') },
    { _id: new ObjectId(13), name: 'Product C', categoryId: new ObjectId('CategoryCCCC') },
    { _id: new ObjectId(111), name: 'Product K', categoryId: new ObjectId('CategoryBBBB') },
  ],
}

describe('Product List API Tests', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = await startApp()
    await fastify.db.collection('categories').insertMany(testData.categories)
    await fastify.db.collection('products').insertMany(testData.products)
  })
  afterAll(async () => await stopApp())

  const searchCases = [
    {
      searchParams: { page: 1, perPage: 5 },
      result: { dataLength: 5, firstData: 'Product A', lastData: 'Product E', totalPageCount: 3 },
    },
    {
      searchParams: { page: 2, perPage: 5 },
      result: { dataLength: 5, firstData: 'Product F', lastData: 'Product J', totalPageCount: 3 },
    },
    {
      searchParams: { page: 3, perPage: 5 },
      result: { dataLength: 1, firstData: 'Product K', lastData: 'Product K', totalPageCount: 3 },
    },
    {
      searchParams: { page: 1, perPage: 100 },
      result: { dataLength: 11, firstData: 'Product A', lastData: 'Product K', totalPageCount: 1 },
    },
    {
      searchParams: { page: 2, perPage: 100 },
      result: { dataLength: 0, totalPageCount: 1 },
    },
    {
      searchParams: { page: 1, perPage: 5, order: 'DESC' },
      result: { dataLength: 5, firstData: 'Product K', lastData: 'Product G', totalPageCount: 3 },
    },
  ]

  test.each(searchCases)(
    'should sort and pageinate - $searchParams ',
    async ({ searchParams, result }) => {
      const response = await fastify.inject({
        method: 'GET',
        url: `/api/products?${new URLSearchParams(searchParams as any).toString()}`,
      })
      // check if the EP response code is as expected
      expect(response.statusCode).toEqual(200)

      // should have expected length and order
      expect(response.json().data.length).toEqual(result.dataLength)
      if (result.dataLength > 0) {
        expect(response.json().data[0].name).toEqual(result.firstData)
        expect(response.json().data[result.dataLength - 1].name).toEqual(result.lastData)
      }
      // should have correct meta with totalCount and totalPageCount
      expect(response.json().meta.totalCount).toEqual(11)
      expect(response.json().meta.totalPageCount).toEqual(result.totalPageCount)
    }
  )
  // check: should resolve products categoryId to the category Object
  // check: should use category icon when product has no own icon
})
