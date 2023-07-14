import { FastifyInstance } from 'fastify'
import { productDbService } from './services/product.db.service'
import { ApiListParams, IdParam, Product } from '@/types'
import { handleError } from '@/services/error.service'

export default async (fastify: FastifyInstance) => {
  // Create Product
  fastify.post('/api/products', async (request, reply) => {
    try {
      const dbService = productDbService(fastify.db)
      const product = request.body as Product
      // Save the product in the "products" collection
      const result = await dbService.createItem(product)
      reply.code(201).send(result)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })

  // Read Product
  fastify.get('/api/products/:id', async (request, reply) => {
    try {
      const dbService = productDbService(request.db)
      const product = await dbService.readItem(request.params as string)
      reply.code(200).send(product)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })

  // Update Product
  fastify.post('/api/products/:id', async (request, reply) => {
    try {
      const dbService = productDbService(request.db)
      const { id } = request.params as IdParam
      const product = request.body as Product
      const result = await dbService.updateItem(id, product)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })

  // Delete Product
  fastify.delete('/api/products/:id', async (request, reply) => {
    try {
      const { id } = request.params as IdParam
      const dbService = productDbService(request.db)
      const result = await dbService.deleteItem(id)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })

  // List Products
  fastify.get('/api/products', async (request, reply) => {
    try {
      const dbService = productDbService(request.db)
      const result = await dbService.listItems(request.query as ApiListParams)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err as Error)
    }
  })
}
