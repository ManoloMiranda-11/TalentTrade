import { Router } from "express";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import { serializarValoracion } from "../utilidades/serializadores.js";
import { requerirAutenticacion } from "../intermediarios/autenticacion.middleware.js";

export const routerValoraciones = Router();

const esquemaCrearValoracion = z.object({
  sesionId: z.string().uuid("sesionId debe ser un UUID valido."),
  valoradoId: z.string().uuid("valoradoId debe ser un UUID valido."),
  puntuacion: z.number().int().min(1, "La puntuacion minima es 1.").max(5, "La puntuacion maxima es 5."),
  comentario: z.string().trim().max(500, "El comentario es demasiado largo.").nullable().optional()
});

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
      mensaje: "La sesion no existe, todavia no se ha completado o no tienes acceso a ella."
    });
  }

  const idValoradoValido = [sesion.teacherId, sesion.learnerId].includes(datosEntrada.valoradoId);

  if (!idValoradoValido) {
    return res.status(400).json({
      mensaje: "La persona valorada no pertenece a esta sesion."
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
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      },
      reviewed: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  });

  return res.status(201).json({
    mensaje: "La valoracion se ha guardado correctamente.",
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
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        reviewed: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.review.findMany({
      where: {
        reviewerId: usuarioActualId
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        reviewed: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
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
