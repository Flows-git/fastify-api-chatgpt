import { FastifyInstance } from 'fastify'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

export async function dbConnectionService(fastify: FastifyInstance) {
  try {
    const mongoUrl = process.env.MONGO_URL ?? ''
    const dbName = process.env.MONGO_DBNAME ?? ''
    const client = new MongoClient(mongoUrl)
    await client.connect()
    console.log('MongoDB connected to:', mongoUrl)
    const db = client.db(dbName)
    fastify.decorate('db', db) // Decorate fastify with the getDb function
    fastify.addHook('onRequest', (request, reply, done) => {
      request.db = db
      done()
    })
    fastify.addHook('onClose', async () => await client.close())
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1)
  }
}
