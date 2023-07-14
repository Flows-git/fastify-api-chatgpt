import { validationError } from '@/services/error.service'
import { ProductCategory } from '@/types'
import { Collection, ObjectId } from 'mongodb'

export default async (collection: Collection, category: ProductCategory, id?: string | ObjectId) => {

  const { name } = category
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
  const existingCategory = (await collection.findOne({ name })) as any
  if (existingCategory && existingCategory._id.toString() !== id?.toString()) {
    throw validationError('category.name.unique', 'Category name must be unique')
  }
}

