import { dbCollectionQueryService } from '@/services/dbCollectionQueryService'
import { Product } from '@/types'
import { Db, ObjectId } from 'mongodb'
import validate from '../product.validation'

export function productDbService(db: Db) {
  const dbService = dbCollectionQueryService<Product>(db, 'products', [
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
  ])

  return {
    ...dbService,
    createItem: async (item: Product) => {
      await validate(db, item)
      // parse category to id
      if (item.category) {
        item.categoryId = new ObjectId(item.category._id)
        delete (item as any).category
      }
      return dbService.createItem(item)
    },
    updateItem: async (id: string | ObjectId, item: Product) => {
      // Check if the product with the specified ID exists
      await dbService.itemExists(id)

      // Validate the product data, excluding the name of the product being updated
      await validate(db, item, id)

      // parse category to id
      if (item.category) {
        item.categoryId = new ObjectId(item.category._id)
        delete (item as any).category
      }
      return dbService.updateItem(id, item)
    },
  }
}
