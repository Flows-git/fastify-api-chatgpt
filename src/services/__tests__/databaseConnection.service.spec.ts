import f from 'fastify'
import { FastifyInstance } from 'fastify'
import { dbConnectionService } from '../databaseConnection.service'

describe('Database Connection Service', () => {
  let fastify: FastifyInstance

  beforeAll(async () => {
    fastify = f()

  })
  beforeEach(async () => jest.clearAllMocks())
  afterAll(async () => await fastify.close())

  test('should connect to a MongoDB database and save the instance in ".db" fastify decoration', async () => { //  and on the request hook
    // connect to MongoDB
    await dbConnectionService(fastify)

    // check if DB instance is set in fastify
    expect(fastify.db).not.toBeUndefined()
    fastify.close()
  })


  // test('should disconnect the connection when fasify closes', async () => {})  //  and on the request hook
  // test('should throw an error and exit the app when connection fails', async () => {})
})
