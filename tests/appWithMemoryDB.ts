import { start } from '@/app'
import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'
import dotenv from 'dotenv'
// Load the environment variables from .env file
dotenv.config()

// contains the running app after start function has been called
let fastify: FastifyInstance
// contains the in-memory MongoDB after start function has been called
let mongoServer: MongoMemoryServer

// Starts the app with a MongoDB in-memory server
export async function startApp() {
  // Start the in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = await mongoServer.getUri()

  // Set the MONGO_URL environment variable to the in-memory server's URI
  process.env.MONGO_URL = mongoUri
  process.env.MONGO_DBNAME = 'test'

  // start a Fastify server
  fastify = await start()

  return fastify
}

// Stops the fastify app the the MongoDB in-memory server
export async function stopApp() {
  await mongoServer.stop()
  await fastify.close()
}

// Removes all items of the database
export async function clearDatabase() {
  // Find all collections of the database
  const collections = await fastify.db.listCollections().toArray()
  // remove all entries in all collections
  collections.forEach(async (c) => {
    await fastify.db.collection(c.name).deleteMany({})
  })
}