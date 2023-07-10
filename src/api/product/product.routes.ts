import { FastifyInstance } from 'fastify';
import createRoute from './routes/product.create'
import deleteRoute from './routes/product.delete'
import listRoute from './routes/product.list'
import readRoute from './routes/product.read'
import updateRoute from './routes/product.update'

export default async (fastify: FastifyInstance) => {
  fastify.post('/api/products', createRoute)
  fastify.get('/api/products/:id', readRoute)
  fastify.post('/api/products/:id', updateRoute)
  fastify.delete('/api/products/:id', deleteRoute)
  fastify.get('/api/products', listRoute)
}