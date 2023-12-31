import { Document, WithId } from 'mongodb'
import type { Product } from './Product'

export interface RecipeIngredient extends WithId<Product> {
  amount: string // how much you need of the ingredient
}
export interface RecipeInstructions {
  title: string
  description: string
}
export interface Recipe extends Document {
  name: string // name of the recipe
  description?: string // short recipe description
  amount: number // amount of people
  duration: string // how long the recipe takes
  ingredients: RecipeIngredient[]
  instructions: { title: string; description: string }[]
}
