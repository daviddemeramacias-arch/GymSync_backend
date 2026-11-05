export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string>[];
  constructor(message = 'Error de validación', errors: Record<string, string>[] = []) {
    super(message, 422);
    this.errors = errors;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto de datos') {
    super(message, 409);
  }
}
