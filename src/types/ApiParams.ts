import { Document, ObjectId } from 'mongodb'

export interface DbModel extends Document {
  _id: ObjectId
}
export interface IdParam {
  id: string
}
