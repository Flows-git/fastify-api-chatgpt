import { start } from '@/app'
import { FastifyInstance } from 'fastify'

// contains the running app after start function has been called
let fastify: FastifyInstance

// start a Fastify server
export async function startApp() {
  fastify = await start()
  return fastify
}

// Stops the fastify server
export async function stopApp() {
  return await fastify.close()
}

// Removes all items of the database
export async function clearDatabase() {
  // Find all collections of the database
  const collections = await fastify.db.listCollections().toArray()
  // remove all entries in all collections
  await collections.forEach(async (c) => {
    return await fastify.db.collection(c.name).deleteMany({})
  })
}
