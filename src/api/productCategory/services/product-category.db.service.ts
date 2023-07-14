import { dbCollectionQueryService } from '@/services/dbCollectionQuery.service'
import { ProductCategory } from '@/types'
import { Db } from 'mongodb'
import validate from './product-category.validation.service'

export function productCategoryDbService(db: Db) {
  return dbCollectionQueryService<ProductCategory>(db, 'categories', { validate })
}
