import { FastifyInstance } from 'fastify';
import createRoute from './routes/recipes.create'
// import deleteRoute from './routes/recipes.delete'
import listRoute from './routes/recipes.list'
// import readRoute from './routes/recipes.read'
// import updateRoute from './routes/recipes.update'

export default async (fastify: FastifyInstance) => {
  fastify.post('/api/recipes', createRoute)
  // fastify.get('/api/recipes/:id', readRoute)
  // fastify.post('/api/recipes/:id', updateRoute)
  // fastify.delete('/api/recipes/:id', deleteRoute)
  fastify.get('/api/recipes', listRoute)
}