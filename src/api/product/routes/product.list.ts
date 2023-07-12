import { RouteHandlerMethod } from 'fastify'
import { Product } from '@/types'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = request.db.collection('products')
    const { page = 1, perPage = 10, sortBy = 'name', order = 'ASC' } = request.query as any

    const sortOrder = order === 'DESC' ? -1 : 1

    // Count total number of products
    const totalCount = await collection.countDocuments()

    // Calculate total page count
    const totalPageCount = Math.ceil(totalCount / perPage)

    // Calculate skip value based on page and perPage
    const skip = (page - 1) * perPage

    // Fetch products with pagination and sorting
    let products = (await collection
      .aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $set: {
            category: { $arrayElemAt: ['$category', 0] },
          },
        },
        {
          $project: {
            categoryId: 0,
          },
        },
      ])
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(perPage))
      .toArray()) as Product[]

    products = (products as Product[]).map((product) => {
      // When the product has no icon use the category icon
      if (!product.icon && product.category?.icon) {
        product.icon = product.category.icon
      }

      return product
    })

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
}

export default routeHandler
