
import { RouteHandlerMethod } from 'fastify'
import { fastify } from '../../../app'
import { IdParam } from '../../../types'
import { ObjectId } from 'mongodb'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = fastify.getDb().collection('products')
    const { id } = request.params as IdParam
    const product = await collection.findOne({ _id: new ObjectId(id) })

    if (!product) {
      reply.code(404).send({ error: 'not_found', message: 'Product not found' })
    } else {
      reply.code(200).send(product)
    }
  } catch (err) {
    console.error('Error retrieving product:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
}

export default routeHandler