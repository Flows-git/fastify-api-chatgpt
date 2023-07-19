import { Document, ObjectId, WithId } from 'mongodb'

export interface Product extends Document {
  name: string
  icon?: string
  category: WithId<ProductCategory>
  categoryId?: ObjectId
}

export interface ProductCategory {
  name: string
  icon: string
  items?: Array<Product>
}