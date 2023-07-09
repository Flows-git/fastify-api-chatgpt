import { DbModel } from './ApiParams'

export interface Product extends DbModel {
  name: string
  icon: string
}
