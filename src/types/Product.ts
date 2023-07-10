import { ObjectId } from 'mongodb'
import { DbModel } from './ApiParams'

export interface Product extends DbModel {
  name: string
  icon?: string
  category: ProductCategory
  categoryId?: ObjectId
}

export interface ProductCategory extends DbModel {
  name: string
  icon: string
  items: Array<Product>
}