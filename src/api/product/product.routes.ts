import { FastifyInstance } from 'fastify'
import { productDbService } from './services/product.db.service'
import { ApiListParams, IdParam, Product } from '@/types'
import { handleError } from '@/services/error.service'

export default async (fastify: FastifyInstance) => {
  // Create Product
  fastify.post<{ Body: Product }>('/api/products', async (request, reply) => {
    try {
      const dbService = productDbService(fastify.db)
      const product = request.body
      // Save the product in the "products" collection
      const result = await dbService.createItem(product)
      reply.code(201).send(result)
    } catch (err) {
      handleError(reply, err)
    }
  })

  // Read Product
  fastify.get<{ Params: string }>('/api/products/:id', async (request, reply) => {
    try {
      const dbService = productDbService(request.db)
      const product = await dbService.readItem(request.params)
      reply.code(200).send(product)
    } catch (err) {
      handleError(reply, err)
    }
  })

  // Update Product
  fastify.post<{ Body: Product; Params: IdParam }>('/api/products/:id', async (request, reply) => {
    try {
      const dbService = productDbService(request.db)
      const { id } = request.params
      const product = request.body
      const result = await dbService.updateItem(id, product)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err)
    }
  })

  // Delete Product
  fastify.delete<{ Params: IdParam }>('/api/products/:id', async (request, reply) => {
    try {
      const { id } = request.params
      const dbService = productDbService(request.db)
      const result = await dbService.deleteItem(id)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err)
    }
  })

  // List Products
  fastify.get<{ Querystring: ApiListParams }>('/api/products', async (request, reply) => {
    try {
      const dbService = productDbService(request.db)
      const result = await dbService.listItems(request.query)
      reply.code(200).send(result)
    } catch (err) {
      handleError(reply, err)
    }
  })
}
