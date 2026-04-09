import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().trim().email("Email no valido."),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres.")
    .max(72, "La contrasena es demasiado larga."),
  name: z.string().trim().min(2, "El nombre es obligatorio.").max(80, "Nombre demasiado largo.")
});

const loginSchema = z.object({
  email: z.string().trim().email("Email no valido."),
  password: z.string().min(1, "La contrasena es obligatoria.")
});

function signAccessToken(user: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no esta configurado.");
  }

  const options: SignOptions = {
    subject: user.id,
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"]
  };

  return jwt.sign({ email: user.email }, secret, {
    ...options
  });
}

authRouter.post("/register", async (req, res) => {
  const input = registerSchema.parse(req.body);
  const email = input.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(409).json({
      message: "Ya existe una cuenta con ese email."
    });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name
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

  const token = signAccessToken(user);

  return res.status(201).json({
    message: "Usuario registrado correctamente.",
    token,
    user
  });
});

authRouter.post("/login", async (req, res) => {
  const input = loginSchema.parse(req.body);
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({
      message: "Credenciales incorrectas."
    });
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Credenciales incorrectas."
    });
  }

  const token = signAccessToken(user);

  return res.status(200).json({
    message: "Login correcto.",
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      city: user.city,
      latitude: user.latitude,
      longitude: user.longitude,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});
