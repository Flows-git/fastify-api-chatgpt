import { ERROR_CODE } from '@/services/error.service'
import validate from '../services/product-category.validation.service'
import { ProductCategory } from '@/types'
import { ObjectId, WithId } from 'mongodb'

// Mock the iconsData module
jest.mock('@/icons.data', () => ['icon1', 'icon2', 'icon3'])

describe('Validate Product Category', () => {
  let db: any
  let collection: any

  beforeEach((done) => {
    db = jest.fn()
    collection = {
      findOne: jest.fn(),
    }
    done()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should throw an error if name is missing', async () => {
    const category = { name: undefined, icon: 'icon1' } as Partial<ProductCategory>
    await expect(validate({ item: category, db, collection })).rejects.toMatchObject({
      code: ERROR_CODE.VALIDATION,
      error: 'category.name.missing',
    })
  })

  test('should throw an error if name is invalid', async () => {
    const category = { name: 'a', icon: 'icon1' } as any
    await expect(validate({ item: category, db, collection })).rejects.toMatchObject({
      code: ERROR_CODE.VALIDATION,
      error: 'category.name.invalid',
    })
  })

  test('should throw an error if name is not unique', async () => {
    // Mock the existingProduct
    const existingProduct = {
      _id: 'existingProductId',
    }
    collection.findOne.mockResolvedValueOnce(existingProduct).mockResolvedValueOnce({ _id: 'category_id!' })

    const category = { _id: 'other_id', name: 'Product 1', icon: 'icon1', category: { _id: 'category_id!' } } as ProductCategory
    await expect(validate({ item: category, db, collection })).rejects.toMatchObject({
      code: ERROR_CODE.VALIDATION,
      error: 'category.name.unique',
    })
  })

  test('should pass validation if name is not unique but ID matches', async () => {
    // Mock the existingProduct with the same ID
    const category = { _id: 'existingProductId' as unknown as ObjectId, name: 'Product 1', icon: 'icon1' } as WithId<ProductCategory>

    collection.findOne.mockResolvedValueOnce(category).mockResolvedValueOnce({ _id: 'category_id!' })

    await expect(validate({ id: category._id, item: category, db, collection })).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(collection.findOne).toHaveBeenCalledWith({ name: 'Product 1' })
  })

  test('should pass validation if all fields are valid', async () => {
    // Mock the existingProduct to simulate no duplicate name
    collection.findOne.mockResolvedValueOnce(null)

    const category = { _id: 'id' as unknown as ObjectId, name: 'Product 1', icon: 'icon1' } as WithId<ProductCategory>
    await expect(validate({ id: category._id, item: category, db, collection })).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(collection.findOne).toHaveBeenCalledWith({ name: 'Product 1' })

    // Ensure that collection.findOne was called once with the correct argument
    // expect(db.collection.findOne).toHaveBeenCalledWith({ _id: 'category_id!' })
  })
})
