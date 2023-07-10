import { RouteHandlerMethod } from 'fastify'
import { fastify } from '@/app'
import { IdParam } from '@/types'
import { ObjectId } from 'mongodb'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = fastify.getDb().collection('categories')
    const { id } = request.params as IdParam
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      reply.code(404).send({ error: 'not_found', message: 'Category not found' })
    } else {
      reply.code(200).send({ message: 'Category deleted successfully' })
    }
  } catch (err) {
    console.error('Error deleting category:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
}

export default routeHandler