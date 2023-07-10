import { RouteHandlerMethod } from 'fastify'
import { fastify } from '@/app'
import { Product } from '@/types'
import validate from '../product.validation'
import { ObjectId } from 'mongodb'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = fastify.getDb().collection('products')
    const product = request.body as Product

    // Validate the product data
    await validate(collection, product)

    // Check if the provided category ID exists
    const existingCategory = await fastify.getDb().collection('categories').findOne({ _id: new ObjectId(product.category?._id) })
    if (!existingCategory) {
      throw { error: 'category.not_found', message: 'Category not found' }
    }

    // parse category to id 
    product.categoryId = new ObjectId(product.category._id)
    delete (product as any).category

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