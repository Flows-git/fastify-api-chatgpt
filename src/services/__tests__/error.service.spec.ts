// TESTS:
// 
// notFoundError - should return an object with status code ERROR_CODE.NOT_FOUND
// handleError - should handle the created errors correctly
// handleError - should handle other errors as internal_server_error

import { FastifyReply } from 'fastify'
import { ERROR_CODE, handleError, notFoundError, validationError } from '../error.service'

describe('Error Service', () => {

  beforeEach(async () => jest.clearAllMocks())

  test('validationError - should return an object with status code ERROR_CODE.VALIDATION', async () => {
    const error = validationError('error_code', 'error message')
    expect(error).toEqual({ code: ERROR_CODE.VALIDATION, error: 'error_code', message: 'error message'})
  })

  test('notFoundError - should return an object with status code ERROR_CODE.NOT_FOUND', async () => {
    const error = notFoundError('error_code', 'error message')
    expect(error).toEqual({ code: ERROR_CODE.NOT_FOUND, error: 'error_code', message: 'error message'})
  })

  test('handleError - should handle the created errors correctly', async () => {
    const reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as unknown as FastifyReply

    handleError(reply, validationError('error_code', 'error message'))
    expect(reply.code).toHaveBeenCalledWith(ERROR_CODE.VALIDATION)
    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ error: 'error_code', message: 'error message'}))
  })

  test('handleError - should handle the created errors correctly', async () => {
    const reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    } as unknown as FastifyReply

    handleError(reply, new Error('other error'))
    expect(reply.code).toHaveBeenCalledWith(500)
    expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ error: 'internal_server_error', message: 'other error' }))
  })
})
