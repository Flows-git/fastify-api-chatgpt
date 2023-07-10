import path from 'path'
import f from 'fastify'
import fastifyStatic from '@fastify/static'

import { connectMongo, getDb } from './db'

import productRoutes from './api/product/product.routes'
import productCategoryRoutes from './api/productCategory/product-category.routes'
import recipesRoutes from './api/recipes/recipes.routes'
import iconsRoutes from './api/icons/icons.routes'

const fastify = f({ logger: true})

// Register the product routes
fastify.register(productRoutes)
fastify.register(productCategoryRoutes)
fastify.register(recipesRoutes)
fastify.register(iconsRoutes)

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  maxAge: 1000 * 60 * 60 * 24, // 24 hrs
})

// Start the Fastify server
const start = async () => {
  try {
    await connectMongo() // Establish MongoDB connection
    fastify.decorate('getDb', getDb) // Decorate fastify with the getDb function
    const addr = await fastify.listen({ port: 8090, host: '0.0.0.0' })
    console.log('Server running on ' + addr)
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

start()

export { fastify }