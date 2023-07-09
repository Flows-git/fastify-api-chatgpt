// productRoutes.js
import { Collection, ObjectId } from 'mongodb'
import validateProduct from '../validation/validateProduct'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { Product, IdParam } from '../types'


// Product routes
const productRoutes = async (fastify: FastifyInstance) => {
  const db = fastify.getDb() // Retrieve the db instance from fastify
  const collection = db.collection('products')

  // POST /api/products endpoint
  fastify.post('/api/products', async (request, reply) => {
    try {
      const product = request.body as Product

      // Validate the product data
      await validateProduct(collection, product)

      // Save the product in the "products" collection
      const result = await collection.insertOne(product)

     // Fetch the created record
      const createdProduct = await collection.findOne({ _id: result.insertedId })

      reply.code(201).send(createdProduct)
    } catch (err: any) {
      console.error('Error saving product:', err)
      reply.code(400).send({ error: err.error, message: err.message })
    }
  })




  
  // GET /api/products endpoint with pagination
  fastify.get('/api/products', async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const { page = 1, perPage = 10, sortBy = 'name', order = 'ASC' } = request.query as any
  
      const sortOrder = order === 'DESC' ? -1 : 1
  
      // Count total number of products
      const totalCount = await collection.countDocuments()
  
      // Calculate total page count
      const totalPageCount = Math.ceil(totalCount / perPage)
  
      // Calculate skip value based on page and perPage
      const skip = (page - 1) * perPage
  
      // Fetch products with pagination and sorting
      const products = await collection
        .find()
        .skip(skip)
        .limit(parseInt(perPage))
        .sort({ [sortBy]: sortOrder })
        .toArray()
  
      // Prepare response
      const response = {
        data: products,
        meta: {
          totalCount,
          totalPageCount,
        },
      }
  
      reply.code(200).send(response)
    } catch (err) {
      console.error('Error retrieving products:', err)
      reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
    }
  })


  // DELETE /api/products/:id endpoint
  fastify.delete('/api/products/:id', async (request, reply) => {
    try {
      const { id } = request.params as IdParam
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
      const { id } = request.params as IdParam
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
      const { id } = request.params as IdParam
      const product = request.body as Product

      // Check if the product with the specified ID exists
      const existingProduct = await collection.findOne({ _id: new ObjectId(id) })
      if (!existingProduct) {
        reply.code(404).send({ error: 'not_found', message: 'Product not found' })
        return
      }

      // Validate the product data, excluding the name of the product being updated
      await validateProduct(collection, product, id)

      // Update the record
      delete (product as any)._id
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: product })

      // Fetch the updated record
      const updatedProduct = await collection.findOne({ _id: new ObjectId(id) })

      reply.code(200).send(updatedProduct)
    } catch (err: any) {
      console.error('Error updating product:', err)
      reply.code(400).send({ error: err.error, message: err.message })
    }
  })
}

export default productRoutes
