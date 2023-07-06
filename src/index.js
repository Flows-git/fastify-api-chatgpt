// index.js
const fastify = require('fastify')({ logger: true })
const { connectMongo, getDb } = require('./db')

// Register the product routes
fastify.register(require('./routes/productRoutes'))

// Start the Fastify server
const start = async () => {
  try {
    await connectMongo() // Establish MongoDB connection
    fastify.decorate('getDb', getDb) // Decorate fastify with the getDb function
    await fastify.listen({ port: 8090, host: '0.0.0.0' })
    console.log('Server running on http://localhost:8090')
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

start()
