import { RouteHandlerMethod } from 'fastify'
import { ProductCategory } from '@/types'
import validate from '../product-category.validation'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = request.db.collection('categories')
    const category = request.body as ProductCategory

    // Validate the category data
    await validate(collection, category)

    // Save the category in the "categories" collection
    const result = await collection.insertOne(category)

    // Fetch the created record
    const createdCategory = await collection.findOne({ _id: result.insertedId })

    reply.code(201).send(createdCategory)
  } catch (err: any) {
    console.error('Error saving category:', err)
    reply.code(400).send({ error: err.error, message: err.message })
  }
}

export default routeHandler