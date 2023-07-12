import { RouteHandlerMethod } from 'fastify'
import { Product } from '@/types'
import { productDbService } from '../services/product.db.service'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const product = request.body as Product
    // Save the product in the "products" collection
    const dbService = productDbService(request.db)
    const result = await dbService.createItem(product)
    reply.code(201).send(result)
  } catch (err: any) {
    console.error('Error saving product:', err)
    reply.code(400).send({ error: err.error, message: err.message })
  }
}

export default routeHandler
