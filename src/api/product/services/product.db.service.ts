import { dbCollectionQueryService } from '@/services/dbCollectionQueryService'
import { Product } from '@/types'
import { Db } from 'mongodb'

export function productDbService(db: Db) {
  return dbCollectionQueryService<Product>(db, 'products', [
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

}
