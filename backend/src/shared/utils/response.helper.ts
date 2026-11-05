import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operación exitosa',
  statusCode = 200,
): Response => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Recurso creado exitosamente',
): Response => sendSuccess(res, data, message, 201);

export const sendPaginated = <T>(
  res: Response,
  items: T[],
  meta: PaginationMeta,
  message = 'Listado obtenido',
): Response => {
  return res.status(200).json({
    status: 'success',
    message,
    data: { items, ...meta },
  });
};

export const sendNoContent = (res: Response): Response => res.status(204).send();
