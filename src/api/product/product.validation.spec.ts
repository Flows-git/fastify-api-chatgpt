import validateProduct from './product.validation'

// Mock the iconsData module
jest.mock('../../icons.data', () => ['icon1', 'icon2', 'icon3'])

describe('validateProduct', () => {
  let collection: any

  beforeEach(() => {
    // Mock the collection object
    collection = {
      findOne: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should throw an error if name is missing', async () => {
    const product = { name: undefined, icon: 'icon1'} as any
    await expect(validateProduct(collection, product)).rejects.toMatchObject({
      error: 'product.name.missing',
    })
  })

  test('should throw an error if name is invalid', async () => {
    const product = { name: 'a', icon: 'icon1'} as any
    await expect(validateProduct(collection, product)).rejects.toMatchObject({
      error: 'product.name.invalid',
    })
  })

  test('should throw an error if icon is missing', async () => {
    const product = { name: 'Product 1', icon: undefined } as any
    await expect(validateProduct(collection, product)).rejects.toMatchObject({
      error: 'product.icon.missing',
    })
  })

  test('should throw an error if icon is invalid', async () => {
    const product = { name: 'Product 1', icon: 'invalidIcon' } as any
    await expect(validateProduct(collection, product)).rejects.toMatchObject({
      error: 'product.icon.invalid',
    })
  })

  test('should throw an error if name is not unique', async () => {
    // Mock the existingProduct
    const existingProduct = {
      _id: 'existingProductId',
    }
    collection.findOne.mockResolvedValueOnce(existingProduct)
    const product = { _id: 'other_id', name: 'Product 1', icon: 'icon1' } as any
    await expect(validateProduct(collection, product)).rejects.toMatchObject({
      error: 'product.name.unique',
    })
  })

  test('should pass validation if name is not unique but ID matches', async () => {
    // Mock the existingProduct with the same ID
    const product = { _id: 'existingProductId', name: 'Product 1', icon: 'icon1' } as any

    collection.findOne.mockResolvedValueOnce(product)

    await expect(validateProduct(collection, product, product._id)).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(collection.findOne).toHaveBeenCalledWith({ name: 'Product 1' })
  })

  test('should pass validation if all fields are valid', async () => {
    // Mock the existingProduct to simulate no duplicate name
    collection.findOne.mockResolvedValueOnce(null)

    const product = { _id: 'id', name: 'Product 1', icon: 'icon1' } as any
    await expect(validateProduct(collection, product)).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(collection.findOne).toHaveBeenCalledWith({ name: 'Product 1' })
  })
})
