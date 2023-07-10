import { FastifyInstance } from 'fastify'
import validateCategory from './product-category.validation'
import { ProductCategory } from '@/types'

const categoryRoutes = async (fastify: FastifyInstance, options: any) => {
  const db = fastify.getDb().collection('categories') // Retrieve the db instance from fastify

  // POST /api/categories endpoint
  fastify.post('/api/categories', async (request, reply) => {
    try {
      const { name, icon } = request.body as ProductCategory

      // Validate category fields
      await validateCategory(db, name, icon)

      // Check if the category name is already taken
      const existingCategory = await db.findOne({ name })
      if (existingCategory) {
        reply.code(400).send({ error: 'category.name.unique', message: 'Category name must be unique' })
        return
      }

      // Create the category
      const result = await db.insertOne({ name, icon })

      // Fetch the saved category from the database
      const insertedId = result.insertedId
      const savedCategory = await db.findOne({ _id: insertedId })

      // Send the saved category in the response
      reply.code(201).send(savedCategory)
    } catch (err) {
      console.error('Error creating category:', err)
      reply.code(500).send({ error: 'internal_server_error', message: 'Internal server error' })
    }
  })
}

export default categoryRoutes
