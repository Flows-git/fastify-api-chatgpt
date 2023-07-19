import { Recipe, RecipeIngredient } from '@/types'
import validate from '../recipe.validation'
import { validationError } from '@/services/error.service'
import { ObjectId } from 'mongodb'

describe('Recipe Validation', () => {
  const db = jest.fn() as any
  const collection = jest.fn() as any

  test('should pass validation for a valid recipe', async () => {
    const recipe: Recipe = {
      name: 'Test Recipe',
      amount: 2,
      duration: '30 mins',
      ingredients: [
        { amount: '100g', _id: new ObjectId(1) } as RecipeIngredient,
        { amount: '200g', _id: new ObjectId(1) } as RecipeIngredient,
      ],
      instructions: [
        { title: 'Step 1', description: 'Do this' },
        { title: 'Step 2', description: 'Do that' },
      ],
    }

    await expect(validate({ item: recipe, db, collection })).resolves.toBeUndefined()
  })

  test('should throw an error if name is missing', async () => {
    const recipe: Partial<Recipe> = {
      amount: 2,
      duration: '30 mins',
      ingredients: [
        { amount: '100g', _id: new ObjectId(1) } as RecipeIngredient,
        { amount: '200g', _id: new ObjectId(1) } as RecipeIngredient,
      ],
      instructions: [
        { title: 'Step 1', description: 'Do this' },
        { title: 'Step 2', description: 'Do that' },
      ],
    }

    await expect(validate({ item: recipe, db, collection })).rejects.toEqual(
      validationError('recipe.name.missing', 'Recipe name is missing')
    )
  })

  test('should throw an error if amount is invalid', async () => {
    const recipe: Partial<Recipe> = {
      name: 'Test Recipe',
      amount: 'invalid' as any,
      duration: '30 mins',
      ingredients: [
        { amount: '100g', _id: new ObjectId(1) } as RecipeIngredient,
        { amount: '200g', _id: new ObjectId(1) } as RecipeIngredient,
      ],
      instructions: [
        { title: 'Step 1', description: 'Do this' },
        { title: 'Step 2', description: 'Do that' },
      ],
    }

    await expect(validate({ item: recipe, db, collection })).rejects.toEqual(
      validationError('recipe.amount.invalid', 'Invalid recipe amount')
    )
  })

  test('should throw an error if duration is missing', async () => {
    const recipe: Partial<Recipe> = {
      name: 'Test Recipe',
      amount: 2,
      ingredients: [
        { amount: '100g', _id: new ObjectId(1) } as RecipeIngredient,
        { amount: '200g', _id: new ObjectId(1) } as RecipeIngredient,
      ],
      instructions: [
        { title: 'Step 1', description: 'Do this' },
        { title: 'Step 2', description: 'Do that' },
      ],
    }

    await expect(validate({ item: recipe, db, collection })).rejects.toEqual(
      validationError('recipe.duration.missing', 'Recipe duration is missing')
    )
  })

  test('should throw an error if ingredients are missing', async () => {
    const recipe: Partial<Recipe> = {
      name: 'Test Recipe',
      amount: 2,
      duration: '30 mins',
      instructions: [
        { title: 'Step 1', description: 'Do this' },
        { title: 'Step 2', description: 'Do that' },
      ],
    }

    await expect(validate({ item: recipe, db, collection })).rejects.toEqual(
      validationError('recipe.ingredients.missing', 'Recipe ingredients are missing')
    )
  })

  test('should throw an error if ingredients are invalid', async () => {
    const recipe: Partial<Recipe> = {
      name: 'Test Recipe',
      amount: 2,
      duration: '30 mins',
      ingredients: [
        { amount: '100g', ingredient: { _id: new ObjectId(1), name: 'Ingredient 1' } as any },
        { ingredient: { _id: new ObjectId(1), name: 'Ingredient 2' } as any } as any,
      ],
      instructions: [
        { title: 'Step 1', description: 'Do this' },
        { title: 'Step 2', description: 'Do that' },
      ],
    }

    await expect(validate({ item: recipe, db, collection })).rejects.toEqual(
      validationError('recipe.ingredients.invalid', 'Invalid recipe ingredients')
    )
  })

  test('should throw an error if instructions are missing', async () => {
    const recipe: Partial<Recipe> = {
      name: 'Test Recipe',
      amount: 2,
      duration: '30 mins',
      ingredients: [
        { amount: '100g', _id: new ObjectId(1) } as RecipeIngredient,
        { amount: '200g', _id: new ObjectId(1) } as RecipeIngredient,
      ],
    }

    await expect(validate({ item: recipe, db, collection })).rejects.toEqual(
      validationError('recipe.instructions.missing', 'Recipe instructions are missing')
    )
  })

  test('should throw an error if instructions are invalid', async () => {
    const recipe: Partial<Recipe> = {
      name: 'Test Recipe',
      amount: 2,
      duration: '30 mins',
      ingredients: [
        { amount: '100g', _id: new ObjectId(1) } as RecipeIngredient,
        { amount: '200g', _id: new ObjectId(1) } as RecipeIngredient,
      ],
      instructions: [{ title: 'Step 1', description: 'Do this' }, { description: 'Do that' } as any],
    }

    await expect(validate({ item: recipe, db, collection })).rejects.toEqual(
      validationError('recipe.instructions.invalid', 'Invalid recipe instructions')
    )
  })
})
