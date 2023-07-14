import { dbCollectionQueryService } from '@/services/dbCollectionQuery.service'
import { Product } from '@/types'
import { Db, ObjectId } from 'mongodb'
import validate from './product.validation.service'

export function productDbService(db: Db) {
  return dbCollectionQueryService<Product>(db, 'products', {
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
    validate,
    parse: ({item}) => {
      if (item.category) {
        item.categoryId = new ObjectId(item.category._id)
        delete (item as any).category
      }
      return item
    }
  })
}
