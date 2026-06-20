export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class FirmNotFoundError extends AppError {
  constructor(slug: string) {
    super(`No firm found for slug: ${slug}`);
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