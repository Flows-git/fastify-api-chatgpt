import { FastifyInstance } from 'fastify'
import { recipeDbService } from './recipe.db.service'
import { ApiListParams, IdParam, Recipe } from '@/types'
import { handleError } from '@/services/error.service'

export default async (fastify: FastifyInstance) => {
  // Create Recipe
  fastify.post<{ Body: Recipe }>('/api/recipes', async (request, reply) => {
    try {
      const dbService = recipeDbService(fastify.db)
      const result = await dbService.createItem(request.body)
      reply.code(201).send(result)
    } catch (err) {
      handleError(reply, err)
    }
  })

  // Read Recipe
  fastify.get<{ Params: string }>('/api/recipes/:id', async (request, reply) => {
    try {
      const dbService = recipeDbService(request.db)
      const recipe = await dbService.readItem(request.params)
      reply.code(200).send(recipe)
    } catch (err) {
      handleError(reply, err)
    }
  })

  // Update Recipe
  fastify.post<{ Body: Recipe, Params: IdParam }>('/api/recipes/:id', async (request, reply) => {
    try {
      const dbService = recipeDbService(request.db)
      const { id } = request.params
      const recipe = request.body
      const result = await dbService.updateItem(id, recipe)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err)
    }
  })

  // Delete Recipe
  fastify.delete<{ Params: IdParam }>('/api/recipes/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const dbService = recipeDbService(request.db)
      const result = await dbService.deleteItem(id)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err)
    }
  })

  // List Recipes
  fastify.get<{ Querystring: ApiListParams }>('/api/recipes', async (request, reply) => {
    try {
      const dbService = recipeDbService(request.db)
      const response = await dbService.listItems(request.query)
      reply.code(200).send(response)
    } catch (err) {
      handleError(reply, err)
    }
  })
}
