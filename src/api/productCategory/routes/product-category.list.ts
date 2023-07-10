import { RouteHandlerMethod } from 'fastify'

const routeHandler: RouteHandlerMethod = async (request, reply) => {
  try {
    const collection = request.db.collection('categories')
    const { page = 1, perPage = 10, sortBy = 'name', order = 'ASC' } = request.query as any

    const sortOrder = order === 'DESC' ? -1 : 1

    // Count total number of products
    const totalCount = await collection.countDocuments()

    // Calculate total page count
    const totalPageCount = Math.ceil(totalCount / perPage)

    // Calculate skip value based on page and perPage
    const skip = (page - 1) * perPage

    // Fetch products with pagination and sorting
    const categories = await collection
      .find()
      .skip(skip)
      .limit(parseInt(perPage))
      .sort({ [sortBy]: sortOrder })
      .toArray()

    // Prepare response
    const response = {
      data: categories,
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