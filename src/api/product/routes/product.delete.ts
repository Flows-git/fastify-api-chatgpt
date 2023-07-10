import { RouteHandlerMethod } from 'fastify'
import { IdParam } from '@/types'
import { ObjectId } from 'mongodb'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = request.db.collection('products')
    const { id } = request.params as IdParam
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      reply.code(404).send({ error: 'product.not_found', message: 'Product not found' })
    } else {
      reply.code(200).send({ message: 'Product deleted successfully' })
    }
  } catch (err) {
    console.error('Error deleting product:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
}

export default routeHandler