import { Product } from '@/types'
import { productDbService } from '../services/product.db.service'
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
  let dbProductService: ReturnType<typeof productDbService>

  beforeEach(() => {
    dbProductService = productDbService({ collection: jest.fn() } as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // create item
  test('createItem - should parse the category object to categroyId', async () => {
    await dbProductService.createItem({ name: 'test create', category: { _id: '123456789012' } } as any)
    expect(dbCollectionQueryService.createItem).toHaveBeenCalledWith({
      name: 'test create',
      categoryId: new ObjectId('123456789012'),
    })
  })

  // update item
  test('updateItem - should parse the category object to categroyId', async () => {
    await dbProductService.updateItem(new ObjectId('210987654321'), {
      name: 'test create',
      category: { _id: '123456789012' },
    } as any)
    expect(dbCollectionQueryService.updateItem).toHaveBeenCalledWith(new ObjectId('210987654321'), {
      name: 'test create',
      categoryId: new ObjectId('123456789012'),
    })
  })

  test('updateItem - should check if item exists', async () => {
    await dbProductService.updateItem(new ObjectId('210987654321'), { name: 'test create' } as Product)
    expect(dbCollectionQueryService.itemExists).toHaveBeenCalledWith(new ObjectId('210987654321'))
  })
})
