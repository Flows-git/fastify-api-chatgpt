import { Collection, Db, ObjectId } from 'mongodb'

import iconsData from '../icons.data'
import { Product } from '../types'

const validateProduct = async (collection: Collection, product: Product, productId?: string) => {
  const {name, icon, _id, category } = product
  // Check for required fields
  if (!name) {
    throw { error: 'product.name.missing', message: 'Product name is missing' }
  }

  // Check name length
  if (name.length < 2) {
    throw { error: 'product.name.invalid', message: 'Product name is invalid' }
  }

  // Check for missing icon
  if (!icon) {
    throw { error: 'product.icon.missing', message: 'Product icon is missing' }
  }

  // Check if the icon is a string and exists in the iconsData array
  if (typeof icon !== 'string' || !iconsData.includes(icon)) {
    throw { error: 'product.icon.invalid', message: 'Product icon is invalid' }
  }

  // Check if the name is already taken 
  const existingProduct = await collection.findOne({ name }) as Product
  if (existingProduct && existingProduct._id.toString() !== productId?.toString()) {
    throw { error: 'product.name.unique', message: 'Product name must be unique' }
  }
}

export default validateProduct