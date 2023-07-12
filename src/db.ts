import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

export const connectMongo = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL ?? ''
    const dbName = process.env.MONGO_DBNAME ?? ''
    const client = new MongoClient(mongoUrl)
    await client.connect()
    console.log('MongoDB connected')
    return client.db(dbName)
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1)
  }
}
