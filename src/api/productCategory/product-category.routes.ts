import { FastifyInstance } from 'fastify';
import createRoute from './routes/product-category.create'
import deleteRoute from './routes/product-category.delete'
import listRoute from './routes/product-category.list'
import readRoute from './routes/product-category.read'
import updateRoute from './routes/product-category.update'

export default async (fastify: FastifyInstance) => {
  fastify.post('/api/categories', createRoute)
  fastify.get('/api/categories/:id', readRoute)
  fastify.post('/api/categories/:id', updateRoute)
  fastify.delete('/api/categories/:id', deleteRoute)
  fastify.get('/api/categories', listRoute)
}