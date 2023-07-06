// productRoutes.js
const { ObjectId } = require('mongodb')
const validateProduct = require('../validation/validateProduct')

// Product routes
const productRoutes = async (fastify) => {
  const db = fastify.getDb() // Retrieve the db instance from fastify

  // POST /api/products endpoint
  fastify.post('/api/products', async (request, reply) => {
    try {
      const { name, icon } = request.body
      const collection = db.collection('products')

      // Validate the product data
      await validateProduct(collection, name, icon)

      // Save the product in the "products" collection
      const result = await collection.insertOne({ name, icon })
      const savedProduct = result.ops[0]

      reply.code(201).send(savedProduct)
    } catch (err) {
      console.error('Error saving product:', err)
      reply.code(400).send({ error: err.error, message: err.message })
    }
  })

  // GET /api/products endpoint
  fastify.get('/api/products', async (request, reply) => {
    console.log('TEST!', db)
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
      const result = await collection.deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        reply.code(404).send({ error: 'not_found', message: 'Product not found' })
      } else {
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
        reply.code(404).send({ error: 'not_found', message: 'Product not found' })
      } else {
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
      const { id } = request.params
      const { name, icon } = request.body
      const collection = db.collection('products')

      // Check if the product with the specified ID exists
      const existingProduct = await collection.findOne({ _id: new ObjectId(id) })
      if (!existingProduct) {
        reply.code(404).send({ error: 'not_found', message: 'Product not found' })
        return
      }

      // Validate the product data, excluding the name of the product being updated
      await validateProduct(collection, name, icon, id)

      // Update the record
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: { name, icon } })

      // Fetch the updated record
      const updatedProduct = await collection.findOne({ _id: new ObjectId(id) })

      reply.code(200).send(updatedProduct)
    } catch (err) {
      console.error('Error updating product:', err)
      reply.code(400).send({ error: err.error, message: err.message })
    }
  })
}

module.exports = productRoutes
