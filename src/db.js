// db.js
const { MongoClient } = require('mongodb')
require('dotenv').config()

const mongoUrl = process.env.MONGO_URL
const dbName = process.env.MONGO_DBNAME

let db = null

const connectMongo = async () => {
  try {
    const client = new MongoClient(mongoUrl, { useUnifiedTopology: true })
    await client.connect()
    db = client.db(dbName)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1)
  }
}

const getDb = () => db

module.exports = { connectMongo, getDb }
