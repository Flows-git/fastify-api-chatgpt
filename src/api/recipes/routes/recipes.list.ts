import { RouteHandlerMethod } from 'fastify'
import { fastify } from '@/app'
import { Product } from '@/types'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = fastify.getDb().collection('recipes')
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
            from: 'products',
            localField: 'ingredients.ingredientId',
            foreignField: '_id',
            as: 'products',
          },
        },
        {
          $addFields: {
            ingredients: {
              $map: {
                input: '$ingredients',
                in: {
                  $mergeObjects: [
                    '$$this',
                    {
                      ingredient: {
                        $first: {
                          $filter: {
                            input: '$products',
                            as: 'i',
                            cond: { $eq: ['$$i._id', '$$this.ingredientId'] },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $unset: ['products', 'ingredients.ingredientId'],
        },
      ])
      .skip(skip)
      .limit(parseInt(perPage))
      .sort({ [sortBy]: sortOrder })
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
