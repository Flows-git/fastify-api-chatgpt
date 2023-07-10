
import { RouteHandlerMethod } from 'fastify'
import { fastify } from '@/app'
import { IdParam, ProductCategory } from '@/types'
import { ObjectId } from 'mongodb'
import validate from '../product-category.validation'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = fastify.getDb().collection('categories')
    const { id } = request.params as IdParam
    const category = request.body as ProductCategory

    // Check if the category with the specified ID exists
    const existingCategory = await collection.findOne({ _id: new ObjectId(id) })
    if (!existingCategory) {
      reply.code(404).send({ error: 'not_found', message: 'Category not found' })
      return
    }

    // Validate the category data, excluding the name of the category being updated
    await validate(collection, category, id)

    // Update the record
    delete (category as any)._id
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: category })

    // Fetch the updated record
    const updatedCategory = await collection.findOne({ _id: new ObjectId(id) })

    reply.code(200).send(updatedCategory)
  } catch (err: any) {
    console.error('Error updating category:', err)
    reply.code(400).send({ error: err.error, message: err.message })
  }
}

export default routeHandler