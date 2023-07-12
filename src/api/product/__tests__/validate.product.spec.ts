import validateProduct from '../services/product.validation.service'

// Mock the iconsData module
jest.mock('@/icons.data', () => ['icon1', 'icon2', 'icon3'])

describe('validateProduct', () => {
  let db: any

  beforeEach(() => {
    const collectionMock = {
      findOne: jest.fn(),
    }
    db = {
        collection: jest.fn().mockReturnValue(collectionMock),
      }
    
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should throw an error if name is missing', async () => {
    const product = { name: undefined, icon: 'icon1' } as any
    await expect(validateProduct(db, product)).rejects.toMatchObject({
      error: 'product.name.missing',
    })
  })

  test('should throw an error if name is invalid', async () => {
    const product = { name: 'a', icon: 'icon1' } as any
    await expect(validateProduct(db, product)).rejects.toMatchObject({
      error: 'product.name.invalid',
    })
  })

  test('should throw an error if name is not unique', async () => {
    // Mock the existingProduct
    const existingProduct = {
      _id: 'existingProductId',
    }
    db.collection().findOne.mockResolvedValueOnce(existingProduct).mockResolvedValueOnce({ _id: 'category_id!'})

    const product = { _id: 'other_id', name: 'Product 1', icon: 'icon1', category: { _id: 'category_id!'} } as any
    await expect(validateProduct(db, product)).rejects.toMatchObject({
      error: 'product.name.unique',
    })
  })

  test('should pass validation if name is not unique but ID matches', async () => {
    // Mock the existingProduct with the same ID
    const product = { _id: 'existingProductId', name: 'Product 1', icon: 'icon1' } as any

    db.collection().findOne.mockResolvedValueOnce(product).mockResolvedValueOnce({ _id: 'category_id!'})

    await expect(validateProduct(db, product, product._id)).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(db.collection().findOne).toHaveBeenCalledWith({ name: 'Product 1' })
  })

  test('should pass validation if all fields are valid', async () => {
    // Mock the existingProduct to simulate no duplicate name
    db.collection().findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ _id: 'category_id!'})

    const product = { _id: 'id', name: 'Product 1', icon: 'icon1', category: { _id: 'category_id!'} } as any
    await expect(validateProduct(db, product)).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(db.collection().findOne).toHaveBeenCalledWith({ name: 'Product 1' })

    // Ensure that collection.findOne was called once with the correct argument
    // expect(db.collection().findOne).toHaveBeenCalledWith({ _id: 'category_id!' })
  })
})
