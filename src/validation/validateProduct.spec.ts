import { Collection } from 'mongodb'

import validateProduct from './validateProduct'

// Mock the iconsData module
jest.mock('../icons.data', () => ['icon1', 'icon2', 'icon3'])

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
    await expect(validateProduct(collection, undefined, 'icon1')).rejects.toEqual({
      error: 'product.name.missing',
      message: 'Product name is missing',
    })
  })

  test('should throw an error if name is invalid', async () => {
    await expect(validateProduct(collection, 'a', 'icon1')).rejects.toEqual({
      error: 'product.name.invalid',
      message: 'Product name is invalid',
    })
  })

  test('should throw an error if icon is missing', async () => {
    await expect(validateProduct(collection, 'Product 1', undefined)).rejects.toEqual({
      error: 'product.icon.missing',
      message: 'Product icon is missing',
    })
  })

  test('should throw an error if icon is invalid', async () => {
    await expect(validateProduct(collection, 'Product 1', 'invalidIcon')).rejects.toEqual({
      error: 'product.icon.invalid',
      message: 'Product icon is invalid',
    })
  })

  test('should throw an error if name is not unique', async () => {
    // Mock the existingProduct
    const existingProduct = {
      _id: 'existingProductId',
    }
    collection.findOne.mockResolvedValueOnce(existingProduct)

    await expect(validateProduct(collection, 'Product 1', 'icon1', 'existingProductId3')).rejects.toEqual({
      error: 'product.name.unique',
      message: 'Product name must be unique',
    })
  })

  test('should pass validation if name is not unique but ID matches', async () => {
    // Mock the existingProduct with the same ID
    const existingProduct = {
      _id: 'existingProductId',
    }
    collection.findOne.mockResolvedValueOnce(existingProduct)

    await expect(validateProduct(collection, 'Product 1', 'icon1', 'existingProductId')).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(collection.findOne).toHaveBeenCalledWith({ name: 'Product 1' })
  })

  test('should pass validation if all fields are valid', async () => {
    // Mock the existingProduct to simulate no duplicate name
    collection.findOne.mockResolvedValueOnce(null)

    await expect(validateProduct(collection, 'Product 1', 'icon1')).resolves.toBeUndefined()

    // Ensure that collection.findOne was called once with the correct argument
    expect(collection.findOne).toHaveBeenCalledWith({ name: 'Product 1' })
  })
})
