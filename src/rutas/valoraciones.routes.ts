import { Router } from "express";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import { serializarValoracion } from "../utilidades/serializadores.js";
import { requerirAutenticacion } from "../intermediarios/autenticacion.middleware.js";

export const routerValoraciones = Router();

const esquemaCrearValoracion = z.object({
  sesionId: z.string().uuid("sesionId debe ser un UUID válido."),
  valoradoId: z.string().uuid("valoradoId debe ser un UUID válido."),
  puntuacion: z.number().int().min(1, "La puntuación mínima es 1.").max(5, "La puntuación máxima es 5."),
  comentario: z.string().trim().max(500, "El comentario es demasiado largo.").nullable().optional()
});

const RESUMEN_USUARIO_VALORACION = {
  select: {
    id: true,
    name: true,
    avatarUrl: true
  }
} as const;

const INCLUDE_VALORACION_COMPLETA = {
  reviewer: RESUMEN_USUARIO_VALORACION,
  reviewed: RESUMEN_USUARIO_VALORACION
} as const;

routerValoraciones.post("/", requerirAutenticacion, async (req, res) => {
  const datosEntrada = esquemaCrearValoracion.parse(req.body);
  const usuarioActualId = req.usuario!.sub;

  if (datosEntrada.valoradoId === usuarioActualId) {
    return res.status(400).json({
      mensaje: "No puedes valorarte a ti mismo."
    });
  }

  const sesion = await prisma.session.findFirst({
    where: {
      id: datosEntrada.sesionId,
      status: "COMPLETED",
      OR: [{ teacherId: usuarioActualId }, { learnerId: usuarioActualId }]
    }
  });

  if (!sesion) {
    return res.status(404).json({
      mensaje: "La sesión no existe, todavía no se ha completado o no tienes acceso a ella."
    });
  }

  const idValoradoValido = [sesion.teacherId, sesion.learnerId].includes(datosEntrada.valoradoId);

  if (!idValoradoValido) {
    return res.status(400).json({
      mensaje: "La persona valorada no pertenece a esta sesión."
    });
  }

  const valoracion = await prisma.review.create({
    data: {
      sessionId: datosEntrada.sesionId,
      reviewerId: usuarioActualId,
      reviewedId: datosEntrada.valoradoId,
      rating: datosEntrada.puntuacion,
      comment: datosEntrada.comentario ?? null
    },
    include: INCLUDE_VALORACION_COMPLETA
  });

  return res.status(201).json({
    mensaje: "La valoración se ha guardado correctamente.",
    valoracion: serializarValoracion(valoracion)
  });
});

routerValoraciones.get("/yo", requerirAutenticacion, async (req, res) => {
  const usuarioActualId = req.usuario!.sub;

  const [recibidas, escritas] = await Promise.all([
    prisma.review.findMany({
      where: {
        reviewedId: usuarioActualId
      },
      include: INCLUDE_VALORACION_COMPLETA,
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.review.findMany({
      where: {
        reviewerId: usuarioActualId
      },
      include: INCLUDE_VALORACION_COMPLETA,
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);

  return res.status(200).json({
    valoracionesRecibidas: recibidas.map(serializarValoracion),
    valoracionesEscritas: escritas.map(serializarValoracion)
  });
});
