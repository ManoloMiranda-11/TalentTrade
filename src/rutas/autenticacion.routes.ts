import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import { serializarPerfilUsuario } from "../utilidades/serializadores.js";

export const routerAutenticacion = Router();

const esquemaRegistro = z.object({
  correo: z.string().trim().email("Introduce un correo valido."),
  contrasena: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres.")
    .max(72, "La contrasena es demasiado larga."),
  nombre: z.string().trim().min(2, "El nombre es obligatorio.").max(80, "El nombre es demasiado largo.")
});

const esquemaInicioSesion = z.object({
  correo: z.string().trim().email("Introduce un correo valido."),
  contrasena: z.string().min(1, "La contrasena es obligatoria.")
});

function firmarTokenAcceso(usuario: { id: string; email: string }) {
  const secreto = process.env.JWT_SECRET;

  if (!secreto) {
    throw new Error("La autenticacion del servidor no esta configurada correctamente.");
  }

  const opciones: SignOptions = {
    subject: usuario.id,
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"]
  };

  return jwt.sign({ correo: usuario.email }, secreto, {
    ...opciones
  });
}

routerAutenticacion.post("/registro", async (req, res) => {
  const datosEntrada = esquemaRegistro.parse(req.body);
  const correoNormalizado = datosEntrada.correo.toLowerCase();

  const usuarioExistente = await prisma.user.findUnique({
    where: { email: correoNormalizado }
  });

  if (usuarioExistente) {
    return res.status(409).json({
      mensaje: "Ya existe una cuenta asociada a ese correo."
    });
  }

  const hashContrasena = await bcrypt.hash(datosEntrada.contrasena, 10);

  const usuario = await prisma.user.create({
    data: {
      email: correoNormalizado,
      passwordHash: hashContrasena,
      name: datosEntrada.nombre
    },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatarUrl: true,
      city: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true
    }
  });

  const token = firmarTokenAcceso(usuario);

  return res.status(201).json({
    mensaje: "La cuenta se ha creado correctamente.",
    token,
    usuario: serializarPerfilUsuario(usuario)
  });
});

routerAutenticacion.post("/inicio-sesion", async (req, res) => {
  const datosEntrada = esquemaInicioSesion.parse(req.body);
  const correoNormalizado = datosEntrada.correo.toLowerCase();

  const usuario = await prisma.user.findUnique({
    where: { email: correoNormalizado }
  });

  if (!usuario) {
    return res.status(401).json({
      mensaje: "El correo o la contrasena no son correctos."
    });
  }

  const contrasenaValida = await bcrypt.compare(datosEntrada.contrasena, usuario.passwordHash);

  if (!contrasenaValida) {
    return res.status(401).json({
      mensaje: "El correo o la contrasena no son correctos."
    });
  }

  const token = firmarTokenAcceso(usuario);

  return res.status(200).json({
    mensaje: "Has iniciado sesion correctamente.",
    token,
    usuario: serializarPerfilUsuario(usuario)
  });
});
