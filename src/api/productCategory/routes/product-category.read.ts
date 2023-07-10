
import { RouteHandlerMethod } from 'fastify'
import { IdParam } from '@/types'
import { ObjectId } from 'mongodb'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = request.db.collection('categories')
    const { id } = request.params as IdParam
    const category = await collection.findOne({ _id: new ObjectId(id) })

    if (!category) {
      reply.code(404).send({ error: 'not_found', message: 'Category not found' })
    } else {
      reply.code(200).send(category)
    }
  } catch (err) {
    console.error('Error retrieving category:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
}

export default routeHandler