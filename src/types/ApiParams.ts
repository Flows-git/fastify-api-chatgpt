
export interface IdParam {
  id: string
}

export interface ApiListParams {
  page?: number
  perPage?: number
  sortBy?: string
  order?: string
}

export interface ApiListResponse<T> {
  data: T[]
  meta: { totalPageCount: number; totalCount: number }
}