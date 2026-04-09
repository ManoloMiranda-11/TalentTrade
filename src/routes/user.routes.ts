import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { serializeUserProfile } from "../lib/serializers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const userRouter = Router();

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(80).optional(),
  bio: z
    .string()
    .trim()
    .max(500, "La bio no puede superar los 500 caracteres.")
    .nullable()
    .optional(),
  avatarUrl: z.string().trim().url("La URL del avatar no es valida.").nullable().optional(),
  city: z.string().trim().max(100, "La ciudad es demasiado larga.").nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional()
});

userRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    include: {
      userSkills: {
        include: {
          skill: true
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({
      message: "Usuario no encontrado."
    });
  }

  return res.status(200).json({
    user: serializeUserProfile(user)
  });
});

userRouter.patch("/me", requireAuth, async (req, res) => {
  const input = updateProfileSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {})
    },
    include: {
      userSkills: {
        include: {
          skill: true
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  return res.status(200).json({
    message: "Perfil actualizado correctamente.",
    user: serializeUserProfile(user)
  });
});
