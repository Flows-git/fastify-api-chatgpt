import { dbCollectionQueryService } from '@/services/dbCollectionQuery.service'
import { ProductCategory } from '@/types'
import { Db, ObjectId } from 'mongodb'
import validate from './product-category.validation.service'

export function productCategoryDbService(db: Db) {
  const dbService = dbCollectionQueryService<ProductCategory>(db, 'categories', { validate })

  // override updateItem to validate the data before update
  async function updateItem(id: string | ObjectId, item: ProductCategory) {
    await dbService.itemExists(id)
    return dbService.updateItem(id, item)
  }

  return {
    ...dbService,
    updateItem,
  }
}
