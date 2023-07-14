import { dbCollectionQueryService } from '@/services/dbCollectionQuery.service'
import { Product } from '@/types'
import { Db, ObjectId } from 'mongodb'
import validate from './product.validation.service'

export function productDbService(db: Db) {
  const dbService = dbCollectionQueryService<Product>(db, 'products', {
    pipeline: [
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $set: {
          category: { $arrayElemAt: ['$category', 0] },
        },
      },
      {
        $project: {
          categoryId: 0,
        },
      },
    ],
    validate
  })

  // override createItem to validate and parse the data before insertion
  async function createItem(item: Product) {
    // parse category to id
    if (item.category) {
      item.categoryId = new ObjectId(item.category._id)
      delete (item as any).category
    }
    return dbService.createItem(item)
  }

  // override updateItem to validate and parse the data before update
  async function updateItem(id: string | ObjectId, item: Product) {
    await dbService.itemExists(id)
    // parse category to id
    if (item.category) {
      item.categoryId = new ObjectId(item.category._id)
      delete (item as any).category
    }
    return dbService.updateItem(id, item)
  }

  return {
    ...dbService,
    createItem,
    updateItem,
  }
}
