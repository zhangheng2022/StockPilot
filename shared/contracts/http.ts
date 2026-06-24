export type ApiSuccess<T> = {
  ok: true
  data: T
}

export type ApiFailure = {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
    requestId?: string
  }
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

export type ValidationFailure = {
  ok: false
  code: 'validation_error'
  message: string
}

export type ParseResult<T> =
  | { ok: true, data: T }
  | ValidationFailure
