import { ValidationFunction } from '@/services/dbCollectionQuery.service'
import { validationError } from '@/services/error.service'
import { Recipe } from '@/types'

const validate: ValidationFunction<Recipe> = async ({ item }) => {
  const { name, amount, duration, ingredients, instructions } = item

  // Check if the name is present
  if (!name) {
    throw validationError('recipe.name.missing', 'Recipe name is missing')
  }

  // Check if the amount is valid
  if (!amount || isNaN(amount) || amount <= 0) {
    throw validationError('recipe.amount.invalid', 'Invalid recipe amount')
  }

  // Check if the duration is present
  if (!duration) {
    throw validationError('recipe.duration.missing', 'Recipe duration is missing')
  }

  // Check if the ingredients are present and the array is not empty
  if (!ingredients || ingredients.length === 0) {
    throw validationError('recipe.ingredients.missing', 'Recipe ingredients are missing')
  }

  // Validate each entry in the ingredients array
  for (const ingredient of ingredients) {
    if (!ingredient.amount || !ingredient.ingredient) {
      throw validationError('recipe.ingredients.invalid', 'Invalid recipe ingredients')
    }
  }

  // Check if the instructions are present and the array is not empty
  if (!instructions || instructions.length === 0) {
    throw validationError('recipe.instructions.missing', 'Recipe instructions are missing')
  }

  // Validate each entry in the instructions array
  for (const instruction of instructions) {
    if (!instruction.title || !instruction.description) {
      throw validationError('recipe.instructions.invalid', 'Invalid recipe instructions')
    }
  }
}

export default validate
