import { ValidationFunction } from '@/services/dbCollectionQuery.service'
import { validationError } from '@/services/error.service'
import { ProductCategory } from '@/types'

const validate: ValidationFunction<ProductCategory> = async ({ id, item, collection }) => {
  const { name } = item
  // Check for required fields
  if (!name) {
    throw validationError('category.name.missing', 'Category name is missing')
  }

  // Check name length
  if (name.length < 2) {
    throw validationError('category.name.invalid', 'Category name is invalid')
  }

  // Check for missing icon
  // if (!icon) {
  //   throw { error: 'category.icon.missing', message: 'Category icon is missing' }
  // }

  // Check if the category name is already taken
  const existingCategory = await collection.findOne({ name })
  if (existingCategory && existingCategory._id.toString() !== id?.toString()) {
    throw validationError('category.name.unique', 'Category name must be unique')
  }
}

export default validate
