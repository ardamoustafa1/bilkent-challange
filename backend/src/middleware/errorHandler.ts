import type { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
  statusCode?: number;
}

export function errorHandler(err: ApiError, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.statusCode ?? 500;
  const message = status === 500 ? "Bir sunucu hatası oluştu." : err.message;

  if (status === 500) {
    console.error(`[error] ${new Date().toISOString()} ${err.message}`, err.stack);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && status === 500 ? { stack: err.stack } : {}),
  });
}
