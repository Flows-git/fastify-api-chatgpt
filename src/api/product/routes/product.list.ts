import { RouteHandlerMethod } from 'fastify'
import { Product } from '@/types'
import { productDbService } from '../services/product.db.service'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const dbService = productDbService(request.db)
    const result = await dbService.listItems(request.query as any)
    
    // When the product has no icon use the category icon
    // result.data = (result.data as Product[]).map((product) => {
    //   if (!product.icon && product.category?.icon) {
    //     product.icon = product.category.icon
    //   }
    //   return product
    // })

    reply.code(200).send(result)
  } catch (err) {
    console.error('Error retrieving products:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
}

export default routeHandler
