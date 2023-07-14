import { clearDatabase, startApp, stopApp } from '@tests/app.start'
import { FastifyInstance } from 'fastify'
import { dbCollectionQueryService } from '../dbCollectionQuery.service'
import { ObjectId } from 'mongodb'

const testData = {
  categories: [
    { _id: new ObjectId('CategoryAAAA'), name: 'Category A', icon: 'category-a-icon' },
    { _id: new ObjectId('CategoryBBBB'), name: 'Category C', icon: 'category-c-icon' },
    { _id: new ObjectId('CategoryCCCC'), name: 'Category B', icon: 'category-b-icon' },
  ],
  items: [
    { name: 'Item J', amount: 1, categoryId: new ObjectId('CategoryAAAA') },
    { name: 'Item B', amount: 2, categoryId: new ObjectId('CategoryBBBB') },
    { name: 'Item H', amount: 3, categoryId: new ObjectId('CategoryBBBB') },
    { name: 'Item I', amount: 4, categoryId: new ObjectId('CategoryCCCC') },
    { name: 'Item E', amount: 5, categoryId: new ObjectId('CategoryBBBB') },
    { name: 'Item G', amount: 6, categoryId: new ObjectId('CategoryAAAA') },
    { name: 'Item D', amount: 7, categoryId: new ObjectId('CategoryAAAA') },
    { name: 'Item A', amount: 8, categoryId: new ObjectId('CategoryAAAA') },
    { name: 'Item F', amount: 9, categoryId: new ObjectId('CategoryCCCC') },
    { name: 'Item C', amount: 10, categoryId: new ObjectId('CategoryCCCC') },
    { name: 'Item K', amount: 11, categoryId: new ObjectId('CategoryBBBB') },
  ],
}

describe('Database Collection Query Service - List and Paginate', () => {
  let fastify: FastifyInstance
  let dbService: ReturnType<typeof dbCollectionQueryService>

  beforeAll(async () => {
    fastify = await startApp()
    await fastify.db.collection('categories').insertMany(testData.categories)
    await fastify.db.collection('items').insertMany(testData.items)
  })
  beforeEach((done) => {
    dbService = dbCollectionQueryService(fastify.db, 'items')
    done()
  })
  afterAll(async () => {
    await clearDatabase()
    await stopApp()
  })
  
  // LIST - listItems
  // test('listItems - should filter and paginate the collection items correctly', async () => {})
  const searchCases = [
    {
      searchParams: { page: 1, perPage: 5, sortBy: 'name' },
      result: { dataLength: 5, firstData: 'Item A', lastData: 'Item E', totalPageCount: 3 },
    },
    {
      searchParams: { page: 2, perPage: 5, sortBy: 'name' },
      result: { dataLength: 5, firstData: 'Item F', lastData: 'Item J', totalPageCount: 3 },
    },
    {
      searchParams: { page: 3, perPage: 5, sortBy: 'name' },
      result: { dataLength: 1, firstData: 'Item K', lastData: 'Item K', totalPageCount: 3 },
    },
    {
      searchParams: { page: 1, perPage: 100, sortBy: 'name' },
      result: { dataLength: 11, firstData: 'Item A', lastData: 'Item K', totalPageCount: 1 },
    },
    {
      searchParams: { page: 2, perPage: 100 },
      result: { dataLength: 0, totalPageCount: 1 },
    },
    {
      searchParams: { page: 1, perPage: 5, order: 'DESC', sortBy: 'name' },
      result: { dataLength: 5, firstData: 'Item K', lastData: 'Item G', totalPageCount: 3 },
    },
    {
      searchParams: { page: 1, perPage: 5, sortBy: 'amount' },
      result: { dataLength: 5, firstData: 'Item J', lastData: 'Item E', totalPageCount: 3 },
    },
    // should return 10 values by default
    {
      searchParams: {},
      result: { dataLength: 10, firstData: 'Item A', lastData: 'Item J', totalPageCount: 2 },
    },
  ]

  test.each(searchCases)(
    'listItems - should filter and paginate the collection items correctly - $searchParams ',
    async ({ searchParams, result: expectedResult }) => {
      const result = await dbService.listItems(searchParams)
      // should have expected length and order
      expect(result.data.length).toEqual(expectedResult.dataLength)
      if (expectedResult.dataLength > 0) {
        expect(result.data[0].name).toEqual(expectedResult.firstData)
        expect(result.data[expectedResult.dataLength - 1].name).toEqual(expectedResult.lastData)
      }
      // should have correct meta with totalCount and totalPageCount
      expect(result.meta.totalCount).toEqual(11)
      expect(result.meta.totalPageCount).toEqual(expectedResult.totalPageCount)
    })
})
