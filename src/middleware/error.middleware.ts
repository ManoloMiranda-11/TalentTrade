import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    message: "Ruta no encontrada."
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Error de validacion.",
      issues: error.flatten()
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Error interno del servidor."
  });
}
