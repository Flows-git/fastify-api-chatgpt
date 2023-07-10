import { RouteHandlerMethod } from 'fastify'
import validate from '../recipes.validation'

import { Recipe } from '@/types'
import { fastify } from '@/app'
import { ObjectId } from 'mongodb'


// POST /api/recipies Endpoint
const routeHandler: RouteHandlerMethod = async (request, reply) => {
    const collection = fastify.getDb().collection('recipes')
    try {
    const recipe = request.body as Recipe

    // Validiere das Rezept
    validate(recipe)

    // parse ingredients
    recipe.ingredients.forEach(ingredient => {
      ingredient.ingredientId =  new ObjectId(ingredient.ingredient._id)
      delete (ingredient as any).ingredient
    })

    // Save the product in the "products" collection
    const result = await collection.insertOne(recipe)

    // Fetch the created record
    const createdRecipe = await collection.findOne({ _id: result.insertedId })

    reply.code(201).send(createdRecipe)
  } catch (err: any) {
    console.error('Error saving product:', err)
    reply.code(400).send({ error: err.error, message: err.message })
  }
}

// Exportiere den Endpunkt
export default routeHandler
