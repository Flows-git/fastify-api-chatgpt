import { Db, ObjectId } from 'mongodb'
import { Product } from '@/types'
import iconsData from '@/icons.data'

export default async (db: Db, product: Product, productId?: string | ObjectId) => {
  const { name, icon } = product
  // Check for required fields
  if (!name) {
    throw { error: 'product.name.missing', message: 'Product name is missing' }
  }

  // Check name length
  if (name.length < 2) {
    throw { error: 'product.name.invalid', message: 'Product name is invalid' }
  }

  // Check if the icon is a string and exists in the iconsData array
  if (typeof icon === 'string' && !iconsData.includes(icon)) {
    throw { error: 'product.icon.invalid', message: 'Product icon is invalid' }
  }

  // Check if the name is already taken
  const existingProduct = (await db.collection('products').findOne({ name })) as Product
  if (existingProduct && existingProduct._id.toString() !== productId?.toString()) {
    throw { error: 'product.name.unique', message: 'Product name must be unique' }
  }

  // Check if the provided category ID exists
  const existingCategory = await db.collection('categories').findOne({ _id: new ObjectId(product.category?._id) })
  if (!existingCategory) {
    throw { error: 'category.not_found', message: 'Category not found' }
  }
}
