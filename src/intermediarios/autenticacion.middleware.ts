import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type UsuarioAutenticado = {
  sub: string;
  correo: string;
};

declare module "express-serve-static-core" {
  interface Request {
    usuario?: UsuarioAutenticado;
  }
}

export function requerirAutenticacion(req: Request, res: Response, next: NextFunction) {
  const cabeceraAutorizacion = req.headers.authorization;

  if (!cabeceraAutorizacion?.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "No se ha enviado un token válido." });
  }

  const token = cabeceraAutorizacion.split(" ")[1];
  const secreto = process.env.JWT_SECRET;

  if (!secreto) {
    return res.status(500).json({ mensaje: "La autenticación del servidor no está configurada correctamente." });
  }

  try {
    const usuario = jwt.verify(token, secreto) as UsuarioAutenticado;
    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ mensaje: "La sesión ha caducado o el token no es válido." });
  }
}
