import { Router } from "express";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import { serializarPerfilUsuario } from "../utilidades/serializadores.js";
import { requerirAutenticacion } from "../intermediarios/autenticacion.middleware.js";

export const routerUsuarios = Router();

const esquemaActualizarPerfil = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(80).optional(),
  biografia: z
    .string()
    .trim()
    .max(500, "La bio no puede superar los 500 caracteres.")
    .nullable()
    .optional(),
  urlAvatar: z.string().trim().url("La URL del avatar no es valida.").nullable().optional(),
  ciudad: z.string().trim().max(100, "La ciudad es demasiado larga.").nullable().optional(),
  latitud: z.number().min(-90).max(90).nullable().optional(),
  longitud: z.number().min(-180).max(180).nullable().optional()
});

routerUsuarios.get("/yo", requerirAutenticacion, async (req, res) => {
  const usuario = await prisma.user.findUnique({
    where: { id: req.usuario!.sub },
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

  if (!usuario) {
    return res.status(404).json({
      mensaje: "No se ha encontrado el usuario."
    });
  }

  return res.status(200).json({
    usuario: serializarPerfilUsuario(usuario)
  });
});

routerUsuarios.patch("/yo", requerirAutenticacion, async (req, res) => {
  const datosEntrada = esquemaActualizarPerfil.parse(req.body);

  const usuario = await prisma.user.update({
    where: { id: req.usuario!.sub },
    data: {
      ...(datosEntrada.nombre !== undefined ? { name: datosEntrada.nombre } : {}),
      ...(datosEntrada.biografia !== undefined ? { bio: datosEntrada.biografia } : {}),
      ...(datosEntrada.urlAvatar !== undefined ? { avatarUrl: datosEntrada.urlAvatar } : {}),
      ...(datosEntrada.ciudad !== undefined ? { city: datosEntrada.ciudad } : {}),
      ...(datosEntrada.latitud !== undefined ? { latitude: datosEntrada.latitud } : {}),
      ...(datosEntrada.longitud !== undefined ? { longitude: datosEntrada.longitud } : {})
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
    mensaje: "El perfil se ha actualizado correctamente.",
    usuario: serializarPerfilUsuario(usuario)
  });
});
