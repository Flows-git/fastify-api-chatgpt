import { ProductCategory } from '@/types'
import { Collection } from 'mongodb'

const validateCategory = async (collection: Collection, category: ProductCategory, id?: string) => {
  const { name } = category
  // Check for required fields
  if (!name) {
    throw { error: 'category.name.missing', message: 'Category name is missing' }
  }

  // Check name length
  if (name.length < 2) {
    throw { error: 'category.name.invalid', message: 'Category name is invalid' }
  }

  // Check for missing icon
  // if (!icon) {
  //   throw { error: 'category.icon.missing', message: 'Category icon is missing' }
  // }
  
  // Check if the category name is already taken
  const existingCategory = (await collection.findOne({ name })) as any
  if (existingCategory && existingCategory._id.toString() !== id?.toString()) {
    throw { error: 'product.name.unique', message: 'Product name must be unique' }
  }
}

export default validateCategory
