import { DbModel } from './ApiParams'

export interface Product extends DbModel {
  name: string
  icon: string
  category: ProductCategory
}

export interface ProductCategory extends DbModel {
  name: string
  icon: string
  items: Array<Product>
}