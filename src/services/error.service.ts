import { FastifyReply } from 'fastify'

export interface AppError {
  code: ERROR_CODE
  error: string
  message?: string
}

export enum ERROR_CODE {
  NOT_FOUND = 404,
  VALIDATION = 400,
  INTERNAL = 500,
}

export function appError(code: ERROR_CODE, error: string, message?: string): AppError {
  return {
    code,
    error,
    message,
  }
}

export function validationError(error: string, message?: string): AppError {
  return appError(ERROR_CODE.VALIDATION, error, message)
}

export function notFoundError(error: string, message?: string): AppError {
  return appError(ERROR_CODE.NOT_FOUND, error, message)
}

export function handleError(reply: FastifyReply, error: Error | AppError) {
  if((error as AppError).code) {
      reply.code((error as AppError).code).send(error)
  } else {
    reply.code(500).send({ error: 'internal_server_error', message: (error as Error).message })
  }
}
