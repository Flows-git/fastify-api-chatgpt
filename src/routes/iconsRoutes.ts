import { FastifyInstance } from 'fastify'
import iconsData from '../icons.data'

const iconsRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/api/icons', async (request, reply) => {
    try {
      reply.code(200).send(iconsData)
    } catch (err) {
      console.error('Error retrieving icons:', err)
      reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
    }
  })
}

export default iconsRoutes
