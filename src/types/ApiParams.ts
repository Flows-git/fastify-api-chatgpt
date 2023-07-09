import { ObjectId } from 'mongodb'

export interface DbModel {
  _id: ObjectId
}
export interface IdParam {
  id: string
}
