import path from 'path'
import f from 'fastify'
import fastifyStatic from '@fastify/static'

import productRoutes from './api/product/product.routes'
import productCategoryRoutes from './api/productCategory/product-category.routes'
import recipesRoutes from './api/recipes/recipes.routes'
import iconsRoutes from './api/icons/icons.routes'
import { dbConnectionService } from './services/databaseConnection.service'

export const fastify = f({ logger: process.env.NODE_ENV !== 'test' })

// Register the product routes
fastify.register(productRoutes)
fastify.register(productCategoryRoutes)
fastify.register(recipesRoutes)
fastify.register(iconsRoutes)

// Register public folder
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  maxAge: 1000 * 60 * 60 * 24, // 24 hrs
})

// Start the Fastify server
export const start = async () => {
  try {
    await dbConnectionService(fastify)
    const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 8090
    const addr = await fastify.listen({ port, host: '0.0.0.0' })
    console.log('Server running on ' + addr)
    return fastify
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

// Start the server if this file is executed directly
if (require.main === module) {
  start()
}
