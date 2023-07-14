import { FastifyInstance } from 'fastify'
import { productCategoryDbService } from './services/product-category.db.service'
import { handleError } from '@/services/error.service'
import { IdParam, ProductCategory } from '@/types'

export default async (fastify: FastifyInstance) => {
  // Create Product Category
  fastify.post('/api/categories', async (request, reply) => {
    try {
      const dbService = productCategoryDbService(request.db)
      const response = await dbService.createItem(request.body as any)
      reply.code(201).send(response)
    } catch (err: any) {
      handleError(reply, err)
    }
  })
  // Read Product Category
  fastify.get('/api/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params as IdParam
      const dbService = productCategoryDbService(request.db)
      const response = await dbService.readItem(id)
      reply.code(200).send(response)
    } catch (err) {
      handleError(reply, err)
    }
  })
  // Update Product Category
  fastify.post('/api/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params as IdParam
      const category = request.body as ProductCategory
      const dbService = productCategoryDbService(request.db)
      const response = await dbService.updateItem(id, category)
      reply.code(200).send(response)
    } catch (err: any) {
      handleError(reply, err)
    }
  })
  // Delete Product Category
  fastify.delete('/api/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params as IdParam
      const dbService = productCategoryDbService(request.db)
      const response = await dbService.deleteItem(id)
      reply.code(200).send(response)
    } catch (err) {
      handleError(reply, err)
    }
  })
  // List Product Category
  fastify.get('/api/categories', async (request, reply) => {
    try {
      const dbService = productCategoryDbService(request.db)
      const response = await dbService.listItems(request.query as any)
      reply.code(200).send(response)
    } catch (err) {
      handleError(reply, err)
    }
  })
}
