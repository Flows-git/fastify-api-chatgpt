import { Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const mongoUrl = process.env.MONGO_URL ?? ''
const dbName = process.env.MONGO_DBNAME ?? ''

let db: Db

export const connectMongo = async () => {
  try {
    const client = new MongoClient(mongoUrl)
    await client.connect()
    db = client.db(dbName)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1)
  }
}

export const getDb = () => db
