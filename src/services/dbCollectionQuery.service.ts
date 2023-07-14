import { Collection, Db, Document, ObjectId, Sort } from 'mongodb'
import { notFoundError } from './error.service'
import { ApiListParams, ApiListResponse } from '@/types'

interface ValidationFunctionContext<T extends Document> {
  item: Partial<T>
  id?: string | ObjectId
  db: Db
  collection: Collection
}
export type ValidationFunction<T extends Document> = (ctx: ValidationFunctionContext<T>) => void | Promise<void>

interface ParseunctionContext<T extends Document> {
  item: T
  db: Db
  collection: Collection
}
export type ParseFunction<T extends Document> = (ctx: ParseunctionContext<T>) => T | Promise<T>

export function dbCollectionQueryService<T extends Document>(
  db: Db,
  collectionName: string,
  ctx?: { pipeline?: Document[]; validate?: ValidationFunction<T>; parse?: ParseFunction<T> }
) {
  const collection = db.collection(collectionName)
  const pipeline = ctx?.pipeline ?? []

  // list the collection entries - sortable, paginateable, custom aggregation pipeline
  async function listItems(
    { page = 1, perPage = 10, sortBy = 'name', order = 'ASC' }: ApiListParams,
    listPipeline?: Document[]
  ): Promise<ApiListResponse<T>> {
    if (!listPipeline) {
      listPipeline = pipeline
    } else {
      listPipeline = [...pipeline, ...listPipeline]
    }
    const sortOrder = order === 'DESC' ? -1 : 1
    // Count total number of products
    const totalCount = await collection.countDocuments()
    // Calculate total page count
    const totalPageCount = Math.ceil(totalCount / perPage)
    // Calculate skip value based on page and perPage
    const skip = (page - 1) * perPage

    let sort: Sort = ''
    if (sortBy) {
      sort = { [sortBy]: sortOrder }
    }

    // Fetch products with pagination and sorting
    let items = await collection
      .aggregate<T>(listPipeline)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(perPage as any))
      .toArray()

    return {
      data: items,
      meta: {
        totalCount,
        totalPageCount,
      },
    }
  }

  async function readItem(id: string | ObjectId, pipeline: Document[] = []) {
    // create pipeline to find element by id
    const readPipeline: Document[] = [{ $match: { _id: new ObjectId(id) } }, ...pipeline]
    // find element with list function limited to 1 result
    const item = await listItems({ perPage: 1 }, readPipeline)
    // throw error when item not exist
    if (!item.data.length) {
      throw notFoundError('item_not_found')
    }
    // return the item
    return item.data[0]
  }

  async function createItem(item: T) {
    if (typeof ctx?.validate === 'function') {
      await ctx.validate({ item, collection, db })
    }

    if (typeof ctx?.parse === 'function') {
      item = await ctx.parse({ item, collection, db })
    }
    delete item._id
    const result = await collection.insertOne(item)
    // Fetch the created record
    return await readItem(result.insertedId)
  }

  async function updateItem(id: string | ObjectId, item: T) {
    await itemExists(id)

    if (typeof ctx?.validate === 'function') {
      await ctx.validate({ id, item, collection, db })
    }
    if (typeof ctx?.parse === 'function') {
      item = await ctx.parse({ item, collection, db })
    }
    // Update the record
    delete item._id
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: item })
    // Fetch the updated record
    return await readItem(id)
  }

  async function deleteItem(id: string | ObjectId) {
    // try to delete the item
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    // throw error when item not exist
    if (result.deletedCount === 0) {
      throw notFoundError('item_not_found')
    }
    return true
  }

  async function itemExists(id: string | ObjectId) {
    const existingProduct = await collection.findOne({ _id: new ObjectId(id) })
    if (!existingProduct) {
      throw notFoundError('item_not_found')
    }
    return true
  }

  return {
    collection,
    listItems,
    readItem,
    createItem,
    updateItem,
    deleteItem,
    itemExists,
  }
}
