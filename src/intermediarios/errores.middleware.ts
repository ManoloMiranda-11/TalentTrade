import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
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
      mensaje: "Algunos datos no son válidos.",
      detalles: errorCapturado.flatten()
    });
  }

  if (errorCapturado instanceof Prisma.PrismaClientKnownRequestError) {
    if (errorCapturado.code === "P2002") {
      return res.status(409).json({
        mensaje: "Ya existe un registro con esos datos."
      });
    }

    if (errorCapturado.code === "P2025") {
      return res.status(404).json({
        mensaje: "No se ha encontrado el recurso solicitado."
      });
    }
  }

  console.error(errorCapturado);

  return res.status(500).json({
    mensaje: "Se ha producido un error interno en el servidor."
  });
}
