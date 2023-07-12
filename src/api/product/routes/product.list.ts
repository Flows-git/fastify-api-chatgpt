import { RouteHandlerMethod } from 'fastify'
import { productDbService } from '../services/product.db.service'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const dbService = productDbService(request.db)
    const result = await dbService.listItems(request.query as any)
    reply.code(200).send(result)
  } catch (err) {
    console.error('Error retrieving products:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
}

export default routeHandler
