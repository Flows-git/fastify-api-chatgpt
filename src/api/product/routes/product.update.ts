
import { RouteHandlerMethod } from 'fastify'
import { IdParam, Product } from '@/types'
import { ObjectId } from 'mongodb'
import validate from '../product.validation'
import { productDbService } from '../services/product.db.service'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = request.db.collection('products')
    const { id } = request.params as IdParam
    const product = request.body as Product

    // Check if the product with the specified ID exists
    const existingProduct = await collection.findOne({ _id: new ObjectId(id) })
    if (!existingProduct) {
      reply.code(404).send({ error: 'not_found', message: 'Product not found' })
      return
    }

    // Validate the product data, excluding the name of the product being updated
    await validate(request.db, product, id)

    // parse category to id 
    product.categoryId = new ObjectId(product.category._id)
    delete (product as any).category

    // Update the record
    const dbService = productDbService(request.db)
    const result = await dbService.updateItem(id, product)

    reply.code(200).send(result)
  } catch (err: any) {
    console.error('Error updating product:', err)
    reply.code(400).send({ error: err.error, message: err.message })
  }
}

export default routeHandler