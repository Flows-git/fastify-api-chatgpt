import { Collection } from 'mongodb'

const validateCategory = async (collection: Collection, name: string, icon: string) => {
  // Check for required fields
  if (!name) {
    throw { error: 'category.name.missing', message: 'Category name is missing' }
  }

  // Check name length
  if (name.length < 2) {
    throw { error: 'category.name.invalid', message: 'Category name is invalid' }
  }

  // Check for missing icon
  if (!icon) {
    throw { error: 'category.icon.missing', message: 'Category icon is missing' }
  }
}

export default validateCategory
