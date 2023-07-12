
import { RouteHandlerMethod } from 'fastify'
import { IdParam, Product } from '@/types'
import { productDbService } from '../services/product.db.service'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const dbService = productDbService(request.db)
    const { id } = request.params as IdParam
    const product = request.body as Product
    const result = await dbService.updateItem(id, product)
    reply.code(200).send(result)
  } catch (err: any) {
    if((err as Error).message === 'item_not_found') {
      reply.code(404).send({ error: 'product.not_found', message: 'Product not found' })
    } else {
      reply.code(400).send({ error: err.error, message: err.message })
    }
  }
}

export default routeHandler