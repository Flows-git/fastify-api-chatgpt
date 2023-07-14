import { Document, ObjectId } from 'mongodb'

export interface Product extends Document {
  name: string
  icon?: string
  category: ProductCategory
  categoryId?: ObjectId
}

export interface ProductCategory extends Document {
  name: string
  icon: string
  items: Array<Product>
}