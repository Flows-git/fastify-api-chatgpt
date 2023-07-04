require('dotenv').config()
const path = require('path')
const fastify = require('fastify')()
const { v4: uuidv4 } = require('uuid')
const MongoClient = require('mongodb').MongoClient

// MongoDB Connection URL
const mongoUrl = process.env.MONGO_URL
// Database Name
const dbName = process.env.DB_NAME
// Collection Name
const collectionName = 'products'

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/',
})

fastify.get('/', async (request, reply) => {
  return 'works!'
})

fastify.post('/api/products/', async (request, reply) => {
  const { name, icon } = request.body

  // Validate name and icon
  if (!name) {
    reply.code(400).send({ error: 'product.name.missing' })
    return
  }

  if (name.length < 2) {
    reply.code(400).send({ error: 'product.name.invalid' })
    return
  }

  if (!icon) {
    reply.code(400).send({ error: 'product.icon.missing' })
    return
  }

  const product = {
    id: uuidv4(),
    name,
    icon,
  }

  try {
    // Connect to MongoDB with authentication
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true })
    const db = client.db(dbName)
    const collection = db.collection(collectionName)

    // Insert product into the collection
    await collection.insertOne(product)

    // Close the MongoDB connection
    client.close()

    reply.send({ success: true, data: product })
  } catch (err) {
    console.error(err)
    reply.code(500).send({ error: 'Internal server error' })
  }
})

const start = async () => {
  try {
    await fastify.listen({
      port: 8090,
      host: '0.0.0.0',
    })
    console.log('Server is running on port 8090')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
