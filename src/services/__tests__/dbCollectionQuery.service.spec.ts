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
