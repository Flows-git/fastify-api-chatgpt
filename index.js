// index.js
const fastify = require('fastify')({ logger: true })
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

const mongoUrl = process.env.MONGO_URL
const dbName = process.env.MONGO_DBNAME

let db = null

// Set the database connection for Fastify
const setDb = (database) => {
  db = database
}

// Create a MongoDB connection before starting the Fastify server
const connectMongo = async () => {
  try {
    const client = new MongoClient(mongoUrl, { useUnifiedTopology: true })
    await client.connect()
    // setDb(client.db(dbName))
    console.log('MongoDB connected')
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1)
  }
}

// POST /api/products endpoint
fastify.post('/api/products', async (request, reply) => {
  try {
    const { name, icon } = request.body

    // Check for required fields
    if (!name) {
      reply.code(400).send({ error: 'product.name.missing', message: 'Product name is missing' })
      return
    }

    // Check name length
    if (name.length < 2) {
      reply.code(400).send({ error: 'product.name.invalid', message: 'Product name is invalid' })
      return
    }

    // Check for missing icon
    if (!icon) {
      reply.code(400).send({ error: 'product.icon.missing', message: 'Product icon is missing' })
      return
    }

    // Check if the name is already taken
    const collection = db.collection('products')
    const existingProduct = await collection.findOne({ name })
    if (existingProduct) {
      reply.code(400).send({ error: 'product.name.unique', message: 'Product name must be unique' })
      return
    }

    // Save the product in the "products" collection
    const result = await collection.insertOne({ name, icon })

    // Fetch the saved product from the database
    const insertedId = result.insertedId
    const savedProduct = await collection.findOne({ _id: insertedId })

    // Send the saved product in the response
    reply.code(201).send(savedProduct)
  } catch (err) {
    console.error('Error saving product:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
})

// GET /api/products endpoint
fastify.get('/api/products', async (request, reply) => {
  try {
    const collection = db.collection('products')
    const products = await collection.find().toArray()
    reply.code(200).send(products)
  } catch (err) {
    console.error('Error retrieving products:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
})

// DELETE /api/products/:id endpoint
fastify.delete('/api/products/:id', async (request, reply) => {
  try {
    const collection = db.collection('products')
    const { id } = request.params
    const { ObjectId } = require('mongodb')
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      // Produkt mit der angegebenen ID wurde nicht gefunden
      reply.code(404).send({ error: 'not_found', message: 'Product not found' })
    } else {
      // Produkt erfolgreich gelöscht
      reply.code(200).send({ message: 'Product deleted successfully' })
    }
  } catch (err) {
    console.error('Error deleting product:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
})

// GET /api/products/:id endpoint
fastify.get('/api/products/:id', async (request, reply) => {
  try {
    const collection = db.collection('products')
    const { id } = request.params
    const product = await collection.findOne({ _id: new ObjectId(id) })

    if (!product) {
      // Produkt mit der angegebenen ID wurde nicht gefunden
      reply.code(404).send({ error: 'not_found', message: 'Product not found' })
    } else {
      // Produkt gefunden, sende es als Antwort
      reply.code(200).send(product)
    }
  } catch (err) {
    console.error('Error retrieving product:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
})

// POST /api/products/:id endpoint
fastify.post('/api/products/:id', async (request, reply) => {
  try {
    const collection = db.collection('products')
    const { id } = request.params
    const { name, icon } = request.body

    // Check if the product with the specified ID exists
    const existingProduct = await collection.findOne({ _id: new ObjectId(id) })
    if (!existingProduct) {
      reply.code(404).send({ error: 'not_found', message: 'Product not found' })
      return
    }

    // Check if the name is unique
    const duplicateProduct = await collection.findOne({ name })
    if (duplicateProduct && duplicateProduct._id.toString() !== id) {
      reply.code(400).send({ error: 'product.name.unique', message: 'Product name must be unique' })
      return
    }

    // Check if the name is missing or too short
    if (!name) {
      reply.code(400).send({ error: 'product.name.missing', message: 'Product name is required' })
      return
    } else if (name.length < 2) {
      reply
        .code(400)
        .send({ error: 'product.name.invalid', message: 'Product name must be at least 2 characters long' })
      return
    }

    // Check if the icon is missing
    if (!icon) {
      reply.code(400).send({ error: 'product.icon.missing', message: 'Product icon is required' })
      return
    }

    // Update the record
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { name, icon } })

    // Fetch the updated record
    const updatedProduct = await collection.findOne({ _id: new ObjectId(id) })

    reply.code(200).send(updatedProduct)
  } catch (err) {
    console.error('Error updating product:', err)
    reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
  }
})

// Export the Fastify instance
module.exports = { setDb }

// Start the Fastify server
const start = async () => {
  try {
    await connectMongo() // Establish MongoDB connection
    await fastify.listen(8090, '0.0.0.0')
    console.log('Server running on http://localhost:8090')
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

start()
