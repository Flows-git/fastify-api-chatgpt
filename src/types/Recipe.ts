import { ObjectId } from 'mongodb'
import type { Product } from './Product'

export interface Recipe {
  name: string // name of the recipe
  description?: string // short recipe description
  amount: number // amount of people
  duration: string // how long the recipe takes
  ingredients: 
    {
      amount: string // how much you need of the ingredient
      ingredient: Product
      ingredientId: ObjectId
    }[],
  
  instructions: { title: string; description: string }[]
}
