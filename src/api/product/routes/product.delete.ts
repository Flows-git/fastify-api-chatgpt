import { RouteHandlerMethod } from 'fastify'
import { IdParam } from '@/types'
import { productDbService } from '../services/product.db.service'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
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
}

export default routeHandler
