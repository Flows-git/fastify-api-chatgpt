import { Db, Document, ObjectId, Sort } from 'mongodb'
import { notFoundError } from './error.service'

export interface ApiListParams {
  page?: number
  perPage?: number
  sortBy?: string
  order?: string
}

export interface ApiListResponse<T> {
  data: T[]
  meta: { totalPageCount: number; totalCount: number }
}

export function dbCollectionQueryService<T extends Document>(
  db: Db,
  collectionName: string,
  pipeline: Document[] = []
) {
  const collection = db.collection(collectionName)

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
    if(sortBy) {
      sort = {[sortBy]: sortOrder}
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

  async function readItem(id: string | ObjectId) {
    // create pipeline to find element by id
    const readPipeline: Document[] = [{ $match: { _id: new ObjectId(id) } }]
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
    const result = await collection.insertOne(item)
    // Fetch the created record
    return await readItem(result.insertedId)
  }

  async function updateItem(id: string | ObjectId, item: T) {
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
    listItems,
    readItem,
    createItem,
    updateItem,
    deleteItem,
    itemExists,
  }
}
