import { FastifyInstance } from 'fastify'
import { recipeDbService } from './recipe.db.service'
import { ApiListParams, IdParam, Recipe } from '@/types'
import { handleError } from '@/services/error.service'

export default async (fastify: FastifyInstance) => {
  // Create Recipe
  fastify.post('/api/recipes', async (request, reply) => {
    try {
      const dbService = recipeDbService(fastify.db)
      const recipe = request.body as Recipe
      const result = await dbService.createItem(recipe)
      reply.code(201).send(result)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })

  // Read Recipe
  fastify.get('/api/recipes/:id', async (request, reply) => {
    try {
      const dbService = recipeDbService(request.db)
      const recipe = await dbService.readItem(request.params as string)
      reply.code(200).send(recipe)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })

  // Update Recipe
  fastify.post('/api/recipes/:id', async (request, reply) => {
    try {
      const dbService = recipeDbService(request.db)
      const { id } = request.params as IdParam
      const recipe = request.body as Recipe
      const result = await dbService.updateItem(id, recipe)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })

  // Delete Recipe
  fastify.delete('/api/recipes/:id', async (request, reply) => {
    try {
      const { id } = request.params as IdParam
      const dbService = recipeDbService(request.db)
      const result = await dbService.deleteItem(id)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })

  // List Recipes
  fastify.get('/api/recipes', async (request, reply) => {
    try {
      const dbService = recipeDbService(request.db)
      const response = await dbService.listItems(request.query as ApiListParams)
      reply.code(200).send(response)
    } catch (err) {
      handleError(reply, err)
    }
  })
}
