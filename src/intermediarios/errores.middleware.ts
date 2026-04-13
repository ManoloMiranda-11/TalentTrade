import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function manejadorRutaNoEncontrada(_req: Request, res: Response) {
  res.status(404).json({
    mensaje: "La ruta solicitada no existe."
  });
}

export function manejadorErrores(
  errorCapturado: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (errorCapturado instanceof ZodError) {
    return res.status(400).json({
      mensaje: "Algunos datos no son validos.",
      detalles: errorCapturado.flatten()
    });
  }

  console.error(errorCapturado);

  return res.status(500).json({
    mensaje: "Se ha producido un error interno en el servidor."
  });
}
