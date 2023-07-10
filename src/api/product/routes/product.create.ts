import { RouteHandlerMethod } from 'fastify'
import { fastify } from '../../../app'
import { Product } from '../../../types'
import validate from '../product.validation'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = fastify.getDb().collection('products')
    const product = request.body as Product

    // Validate the product data
    await validate(collection, product)

    // Save the product in the "products" collection
    const result = await collection.insertOne(product)

    // Fetch the created record
    const createdProduct = await collection.findOne({ _id: result.insertedId })

    reply.code(201).send(createdProduct)
  } catch (err: any) {
    console.error('Error saving product:', err)
    reply.code(400).send({ error: err.error, message: err.message })
  }
}

export default routeHandler