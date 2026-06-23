export type ApiSuccess<T> = {
  data: T
}

export type ApiFailure = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure
