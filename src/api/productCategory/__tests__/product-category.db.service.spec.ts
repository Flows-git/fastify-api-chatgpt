import { ProductCategory } from '@/types'
import { productCategoryDbService } from '../services/product-category.db.service'

import validate from '../services/product-category.validation.service'
import { ObjectId } from 'mongodb'

// Mock the validation
jest.mock('../services/product-category.validation.service')

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

  // create item
  test('createItem - should call validation function', async () => {
    const validateMock = jest.mocked(validate).mockResolvedValue()
    await dbProductService.createItem({ name: 'test create' } as ProductCategory)
    expect(validateMock).toHaveBeenCalled()
  })

  // update item
  test('updateItem - should call validation function', async () => {
    const validateMock = jest.mocked(validate).mockResolvedValue()
    await dbProductService.updateItem(new ObjectId('210987654321'), { name: 'test create' } as ProductCategory)
    expect(validateMock).toHaveBeenCalled()
  })

  test('updateItem - should check if item exists', async () => {
    await dbProductService.updateItem(new ObjectId('210987654321'), { name: 'test create' } as ProductCategory)
    expect(dbCollectionQueryService.itemExists).toHaveBeenCalledWith(new ObjectId('210987654321'))
  })
})
