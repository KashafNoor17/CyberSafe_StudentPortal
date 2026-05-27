import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  getUserErrorMessage,
} from '@/lib/errors';

describe('Error classes', () => {
  it('AppError has correct properties', () => {
    const err = new AppError('fail', 'TEST', 500, false);
    expect(err.message).toBe('fail');
    expect(err.code).toBe('TEST');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
    expect(err).toBeInstanceOf(Error);
  });

  it('ValidationError defaults to 400', () => {
    const err = new ValidationError('bad input', ['email']);
    expect(err.statusCode).toBe(400);
    expect(err.fields).toEqual(['email']);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('AuthenticationError defaults correctly', () => {
    const err = new AuthenticationError();
    expect(err.message).toBe('Authentication required');
    expect(err.statusCode).toBe(401);
  });

  it('NotFoundError defaults correctly', () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
  });

  it('RateLimitError defaults correctly', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
  });
});

describe('getUserErrorMessage', () => {
  it('returns operational AppError messages', () => {
    const err = new AppError('Session expired', 'AUTH', 401, true);
    expect(getUserErrorMessage(err)).toBe('Session expired');
  });

  it('returns raw message for non-operational errors in DEV mode', () => {
    const err = new AppError('DB connection failed', 'INTERNAL', 500, false);
    // In DEV/test, non-operational errors fall through to Error instanceof → show raw message
    expect(getUserErrorMessage(err)).toBe('DB connection failed');
  });

  it('returns generic message for unknown errors', () => {
    expect(getUserErrorMessage('string error')).toBe('An unexpected error occurred. Please try again.');
    expect(getUserErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    expect(getUserErrorMessage(42)).toBe('An unexpected error occurred. Please try again.');
  });
});
