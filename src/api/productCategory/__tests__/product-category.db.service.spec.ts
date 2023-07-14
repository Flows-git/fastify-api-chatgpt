import { ProductCategory } from '@/types'
import { productCategoryDbService } from '../services/product-category.db.service'

import { ObjectId } from 'mongodb'

// Mock the database requests
const dbCollectionQueryService = {
  listItem: jest.fn().mockImplementation(),
  createItem: jest.fn().mockImplementation(),
  readItem: jest.fn().mockImplementation(),
  updateItem: jest.fn().mockImplementation(),
  deleteItem: jest.fn().mockImplementation(),
  itemExists: jest.fn().mockImplementation(),
}
jest.mock('@/services/dbCollectionQuery.service', () => ({ dbCollectionQueryService: () => dbCollectionQueryService }))

describe('validateProduct', () => {
  let dbProductService: ReturnType<typeof productCategoryDbService>

  beforeEach(() => {
    dbProductService = productCategoryDbService('this is a db instance' as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // update item
  test('updateItem - should check if item exists', async () => {
    await dbProductService.updateItem(new ObjectId('210987654321'), { name: 'test create' } as ProductCategory)
    expect(dbCollectionQueryService.itemExists).toHaveBeenCalledWith(new ObjectId('210987654321'))
  })
})
