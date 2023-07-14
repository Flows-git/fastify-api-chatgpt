import { clearDatabase, startApp, stopApp } from '@tests/app.start'
import { FastifyInstance } from 'fastify'
import { dbCollectionQueryService } from '../dbCollectionQuery.service'
import { ObjectId } from 'mongodb'
import { ERROR_CODE } from '../error.service'

describe('Database Collection Query Service', () => {
  let fastify: FastifyInstance
  let dbService: ReturnType<typeof dbCollectionQueryService>

  beforeAll(async () => {
    fastify = await startApp()
    dbService = dbCollectionQueryService(fastify.db, 'items')
  })
  beforeEach(async () => await clearDatabase())
  afterAll(async () => await stopApp())

  // READ - readItem
  test('readItem - should return the requested item', async () => {
    // insert item to read
    const { insertedId } = await fastify.db.collection('items').insertOne({ name: 'Item' })
    // read item
    const item = await dbService.readItem(insertedId)
    // check if data is correct
    expect(item).toEqual(expect.objectContaining({ name: 'Item' }))
  })

  test('readItem - should throw "item_not_found" error when the item dont exist', async () => {
    expect(async () => {
      await dbService.readItem('123456789012')
    }).rejects.toMatchObject(expect.objectContaining({ code: ERROR_CODE.NOT_FOUND }))
  })

  // CREATE - createItem
  test('createItem - should save the item in the DB and return it ', async () => {
    // (with aggregation)
    const response = await dbService.createItem({ name: 'create item' })

    // check if the data is correctly saved in DB
    const item = await fastify.db.collection('items').findOne({ _id: new ObjectId(response._id) })

    expect(item).toEqual(expect.objectContaining({ name: 'create item' }))
    expect(item?._id).not.toBeUndefined()
  })

  test('createItem - should call validation when set ', async () => {
    const validate = jest.fn().mockImplementation() as any
    dbService = dbCollectionQueryService(fastify.db, 'items', { validate })
    await dbService.createItem({ name: 'create item' })
    expect(validate).toHaveBeenCalled()
    expect(validate).toHaveBeenCalledWith(
      { item: expect.objectContaining({ name: 'create item' }), db: expect.anything(), collection: expect.anything() }
    )
  })

  test('createItem - should call data parse function when set ', async () => {
    const parse = jest.fn().mockReturnThis() as any
    const _dbService = dbCollectionQueryService(fastify.db, 'items', { parse })
    await _dbService.createItem({ name: 'create item' })
    expect(parse).toHaveBeenCalled()
    expect(parse).toHaveBeenCalledWith(
      { item: expect.objectContaining({ name: 'create item' }), db: expect.anything(), collection: expect.anything() }
    )
  })

  // UPDATE - updateItem
  test('updateItem - should update the item with the passed ID and return it', async () => {
    // (with aggregation)
    const { insertedId } = await fastify.db.collection('items').insertOne({ name: 'Item' })

    const response = await dbService.updateItem(insertedId, { name: 'updated item' })

    // check if the data is correctly saved in DB
    const item = await fastify.db.collection('items').findOne({ _id: new ObjectId(response._id) })

    expect(item).toEqual(expect.objectContaining({ name: 'updated item' }))
  })

  test('updateItem - should throw "item_not_found" error when the item dont exist', async () => {
    expect(async () => {
      await dbService.updateItem('123456789012', { name: 'not existing item' })
    }).rejects.toMatchObject(expect.objectContaining({ code: ERROR_CODE.NOT_FOUND }))
  })


  test('updateItem - should call validation when set ', async () => {
    const { insertedId } = await fastify.db.collection('items').insertOne({ name: 'Item' })

    const validate = jest.fn().mockImplementation() as any
    dbService = dbCollectionQueryService(fastify.db, 'items', { validate })
    await dbService.updateItem(insertedId, { name: 'updated item' })
    expect(validate).toHaveBeenCalled()
    expect(validate).toHaveBeenCalledWith(
      { id: insertedId, item: expect.objectContaining({ name: 'updated item' }), db: expect.anything(), collection: expect.anything() }
    )
  })

  test('updateItem - should call item parseing when set ', async () => {
    const { insertedId } = await fastify.db.collection('items').insertOne({ name: 'Item' })

    const parse = jest.fn().mockReturnThis() as any
    dbService = dbCollectionQueryService(fastify.db, 'items', { parse })
    await dbService.updateItem(insertedId, { name: 'updated item' })
    expect(parse).toHaveBeenCalled()
    expect(parse).toHaveBeenCalledWith(
      { item: expect.objectContaining({ name: 'updated item' }), db: expect.anything(), collection: expect.anything() }
    )
  })

  // DELETE - delteItem
  test('deleteItem - should delete the item in the DB', async () => {
    const { insertedId } = await fastify.db.collection('items').insertOne({ name: 'Item to delete' })
    await dbService.deleteItem(insertedId)

    // check if product was really deleted
    const item = await fastify.db.collection('products').findOne({ _id: insertedId })
    expect(item).toBeNull()
  })

  test('deleteItem - should throw "item_not_found" error when the item dont exist', async () => {
    expect(async () => {
      await dbService.deleteItem('123456789012')
    }).rejects.toMatchObject(expect.objectContaining({ code: ERROR_CODE.NOT_FOUND }))
  })

  // EXISTS - itemExists
  test('itemExists - should return true if item exists', async () => {
    const { insertedId } = await fastify.db.collection('items').insertOne({ name: 'Item to delete' })
    const exists = await dbService.itemExists(insertedId)
    expect(exists).toBeTruthy()
  })

  test('itemExists - should throw "item_not_found" error when the item dont exist', async () => {
    expect(async () => {
      await dbService.itemExists('123456789012')
    }).rejects.toMatchObject(expect.objectContaining({ code: ERROR_CODE.NOT_FOUND }))
  })

  // LIST - listItems
  // test('listItems - should filter and paginate the collection items correctly', async () => {})
})
