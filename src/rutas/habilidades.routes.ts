import { Router } from "express";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import {
  mapearNivelHabilidadPrisma,
  mapearTipoHabilidadPrisma,
  serializarHabilidad,
  serializarHabilidadUsuario
} from "../utilidades/serializadores.js";
import { requerirAutenticacion } from "../intermediarios/autenticacion.middleware.js";

export const routerHabilidades = Router();

const esquemaAsignarHabilidad = z.object({
  habilidadId: z.string().uuid("habilidadId debe ser un UUID valido."),
  tipo: z.enum(["OFRECER", "APRENDER"]),
  nivel: z.enum(["INICIAL", "MEDIO", "AVANZADO"])
});

routerHabilidades.get("/", async (_req, res) => {
  const habilidades = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });

  return res.status(200).json({
    habilidades: habilidades.map(serializarHabilidad)
  });
});

routerHabilidades.post("/yo", requerirAutenticacion, async (req, res) => {
  const datosEntrada = esquemaAsignarHabilidad.parse(req.body);
  const tipoHabilidad = mapearTipoHabilidadPrisma(datosEntrada.tipo);
  const nivelHabilidad = mapearNivelHabilidadPrisma(datosEntrada.nivel);

  const habilidad = await prisma.skill.findUnique({
    where: { id: datosEntrada.habilidadId }
  });

  if (!habilidad) {
    return res.status(404).json({
      mensaje: "La habilidad seleccionada no existe."
    });
  }

  const habilidadUsuario = await prisma.userSkill.upsert({
    where: {
      userId_skillId_type: {
        userId: req.usuario!.sub,
        skillId: datosEntrada.habilidadId,
        type: tipoHabilidad
      }
    },
    update: {
      level: nivelHabilidad
    },
    create: {
      userId: req.usuario!.sub,
      skillId: datosEntrada.habilidadId,
      type: tipoHabilidad,
      level: nivelHabilidad
    },
    include: {
      skill: true
    }
  });

  return res.status(200).json({
    mensaje: "La habilidad se ha guardado correctamente.",
    habilidadUsuario: serializarHabilidadUsuario(habilidadUsuario)
  });
});

routerHabilidades.delete("/yo/:habilidadUsuarioId", requerirAutenticacion, async (req, res) => {
  const esquemaParametrosHabilidadUsuario = z.object({
    habilidadUsuarioId: z.string().uuid("habilidadUsuarioId debe ser un UUID valido.")
  });

  const { habilidadUsuarioId } = esquemaParametrosHabilidadUsuario.parse(req.params);

  const habilidadUsuarioExistente = await prisma.userSkill.findFirst({
    where: {
      id: habilidadUsuarioId,
      userId: req.usuario!.sub
    }
  });

  if (!habilidadUsuarioExistente) {
    return res.status(404).json({
      mensaje: "La habilidad indicada no existe en tu perfil."
    });
  }

  await prisma.userSkill.delete({
    where: {
      id: habilidadUsuarioId
    }
  });

  return res.status(200).json({
    mensaje: "La habilidad se ha eliminado correctamente."
  });
});
