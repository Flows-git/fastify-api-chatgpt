import { FastifyInstance } from 'fastify'
import { productDbService } from './services/product.db.service'
import { IdParam, Product } from '@/types'

export default async (fastify: FastifyInstance) => {
  const dbService = productDbService(fastify.db)

  // Create Product
  fastify.post('/api/products', async (request, reply) => {
    try {
      const product = request.body as Product
      // Save the product in the "products" collection
      const result = await dbService.createItem(product)
      reply.code(201).send(result)
    } catch (err: any) {
      console.error('Error saving product:', err)
      reply.code(400).send({ error: err.error, message: err.message })
    }
  })

  // Read Product
  fastify.get('/api/products/:id', async (request, reply) => {
    try {
      const dbService = productDbService(request.db)
      const product = await dbService.readItem(request.params as string)
      reply.code(200).send(product)
    } catch (err) {
      if ((err as Error).message === 'item_not_found') {
        reply.code(404).send({ error: 'product.not_found', message: 'Product not found' })
      } else {
        reply.code(500).send({ error: 'internal_server_error', message: (err as Error).message })
      }
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
    } catch (err: any) {
      if ((err as Error).message === 'item_not_found') {
        reply.code(404).send({ error: 'product.not_found', message: 'Product not found' })
      } else {
        reply.code(400).send({ error: err.error, message: err.message })
      }
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
      if ((err as Error).message === 'item_not_found') {
        reply.code(404).send({ error: 'product.not_found', message: 'Product not found' })
      } else {
        reply.code(500).send({ error: 'internal_server_error', message: (err as Error).message })
      }
    }
  })

  // List Products
  fastify.get('/api/products', async (request, reply) => {
    try {
      const dbService = productDbService(request.db)
      const result = await dbService.listItems(request.query as any)
      reply.code(200).send(result)
    } catch (err) {
      console.error('Error retrieving products:', err)
      reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
    }
  })
}
