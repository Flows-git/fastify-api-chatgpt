import 'tsconfig-paths/register'
// import { clearDatabase, startApp, stopApp } from './appWithMemoryDB'
import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'

export let fastify: FastifyInstance

export default async function () {
  // Start the in-memory MongoDB server for testing
  const mongoServer = await MongoMemoryServer.create()
  const mongoUri = await mongoServer.getUri()
  console.log('MongoMemoryServer started at: ' + mongoUri)

  // Set the MONGO_URL environment variable to the in-memory server's URI
  process.env.MONGO_URL = mongoUri
  process.env.MONGO_DBNAME = 'test'
  process.env.APP_PORT = '5555'

  // Add server to global to close it on teardown
  global.mongo = mongoServer
}
