/**
 * Error Handler Global
 * Captura e trata todos os erros da aplicação
 */

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let message = 'Erro interno do servidor';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log do erro
  console.error('❌ Erro:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Em produção, não expor detalhes internos
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    message = 'Erro interno do servidor';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Async error wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Erros comuns pré-definidos
export const errors = {
  notFound: (resource: string) => new AppError(`${resource} não encontrado`, 404),
  unauthorized: () => new AppError('Não autorizado', 401),
  forbidden: () => new AppError('Acesso negado', 403),
  badRequest: (message: string) => new AppError(message, 400),
  conflict: (message: string) => new AppError(message, 409),
  tooManyRequests: () => new AppError('Muitas requisições', 429),
  serviceUnavailable: () => new AppError('Serviço indisponível', 503)
};

