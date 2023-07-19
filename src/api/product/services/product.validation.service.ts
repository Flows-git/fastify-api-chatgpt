import { ObjectId } from 'mongodb'
import { Product } from '@/types'
import iconsData from '@/icons.data'
import { validationError } from '@/services/error.service'
import { ValidationFunction } from '@/services/dbCollectionQuery.service'

const validate: ValidationFunction<Product> = async ({id, item, collection, db}) => {
  const { name, icon } = item
  // Check for required fields
  if (!name) {
    throw validationError('product.name.missing', 'Product name is missing')
  }

  // Check name length
  if (name.length < 2) {
    throw validationError('product.name.invalid', 'Product name is invalid' )
  }

  // Check if the icon is a string and exists in the iconsData array
  if (typeof icon === 'string' && !iconsData.includes(icon)) {
    throw validationError('product.icon.invalid', 'Product icon is invalid' )
  }

  // Check if the name is already taken
  const existingProduct = (await collection.findOne<Product>({ name }))
  if (existingProduct && existingProduct._id.toString() !== id?.toString()) {
    throw validationError('product.name.unique', 'Product name must be unique' )
  }

  // Check if the provided category ID exists
  const existingCategory = await db.collection('categories').findOne({ _id: new ObjectId(item.category?._id) })
  if (!existingCategory) {
    throw validationError('product.category.not_found', 'Category not found' )
  }
}

export default validate
