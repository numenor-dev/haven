import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class FirmNotFoundError extends AppError {
  constructor(slug: string) {
    super(`No firm found for ${slug}`);
  }
}

export class AttorneyNotFoundError extends AppError {
  constructor(attorneyId: string) {
    super(`Attorney not found: ${attorneyId}`);
  }
}

export class TrialExhaustedError extends AppError {
  constructor() {
    super('Trial already used');
  }
}

export class SessionNotFoundError extends AppError {
  constructor(id: string) {
    super(`Session not found: ${id}`);
  }
}

export class ConcurrentSessionError extends AppError {
  constructor(attorneyId: string) {
    super(`Active trial ${attorneyId} already in progress`);
  }
}

export class ChatRecordNotFoundError extends AppError {
  constructor(sessionId: string) {
    super(`Chat record not found: ${sessionId}`)
  }
}

const statusMap: Map<typeof AppError, number> = new Map([
  [FirmNotFoundError, 404],
  [AttorneyNotFoundError, 404],
  [SessionNotFoundError, 404],
  [TrialExhaustedError, 403],
  [ConcurrentSessionError, 409],
  [ChatRecordNotFoundError, 404]
]);

export function handleApiError(err: unknown): NextResponse {
  for (const [ErrorClass, status] of statusMap) {
    if (err instanceof ErrorClass) {
      return NextResponse.json({ error: err.message }, { status });
    }
  }
  console.error('Unhandled error:', err);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}