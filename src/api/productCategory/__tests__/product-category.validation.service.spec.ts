import { ERROR_CODE } from '@/services/error.service'
import validate from '../services/product-category.validation.service'

// Mock the iconsData module
jest.mock('@/icons.data', () => ['icon1', 'icon2', 'icon3'])

describe('Validate Product Category', () => {
  let collection: any

  beforeEach((done) => {
    collection = {
      findOne: jest.fn(),
    }
    done()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should throw an error if name is missing', async () => {
    const category = { name: undefined, icon: 'icon1' } as any
    await expect(validate(collection, category)).rejects.toMatchObject({
      code: ERROR_CODE.VALIDATION,
      error: 'category.name.missing',
    })
  })

  test('should throw an error if name is invalid', async () => {
    const category = { name: 'a', icon: 'icon1' } as any
    await expect(validate(collection, category)).rejects.toMatchObject({
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

    const product = { _id: 'other_id', name: 'Product 1', icon: 'icon1', category: { _id: 'category_id!' } } as any
    await expect(validate(collection, product)).rejects.toMatchObject({
      code: ERROR_CODE.VALIDATION,
      error: 'category.name.unique',
    })
  })

  test('should pass validation if name is not unique but ID matches', async () => {
    // Mock the existingProduct with the same ID
    const product = { _id: 'existingProductId', name: 'Product 1', icon: 'icon1' } as any

    collection.findOne.mockResolvedValueOnce(product).mockResolvedValueOnce({ _id: 'category_id!' })

    await expect(validate(collection, product, product._id)).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(collection.findOne).toHaveBeenCalledWith({ name: 'Product 1' })
  })

  test('should pass validation if all fields are valid', async () => {
    // Mock the existingProduct to simulate no duplicate name
    collection.findOne.mockResolvedValueOnce(null)

    const product = { _id: 'id', name: 'Product 1', icon: 'icon1' } as any
    await expect(validate(collection, product)).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(collection.findOne).toHaveBeenCalledWith({ name: 'Product 1' })

    // Ensure that collection.findOne was called once with the correct argument
    // expect(db.collection.findOne).toHaveBeenCalledWith({ _id: 'category_id!' })
  })
})
