import f from 'fastify'
import { connectMongo, getDb } from './db'

import productRoutes from './routes/productRoutes'
import iconsRoutes from './routes/iconsRoutes'

const fastify = f()

// Register the product routes
fastify.register(productRoutes)
fastify.register(iconsRoutes)
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
