import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { serializeReview } from "../lib/serializers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const reviewRouter = Router();

const createReviewSchema = z.object({
  sessionId: z.string().uuid("sessionId debe ser un UUID valido."),
  reviewedId: z.string().uuid("reviewedId debe ser un UUID valido."),
  rating: z.number().int().min(1, "La puntuacion minima es 1.").max(5, "La puntuacion maxima es 5."),
  comment: z.string().trim().max(500, "El comentario es demasiado largo.").nullable().optional()
});

reviewRouter.post("/", requireAuth, async (req, res) => {
  const input = createReviewSchema.parse(req.body);
  const currentUserId = req.user!.sub;

  if (input.reviewedId === currentUserId) {
    return res.status(400).json({
      message: "No puedes valorarte a ti mismo."
    });
  }

  const session = await prisma.session.findFirst({
    where: {
      id: input.sessionId,
      status: "COMPLETED",
      OR: [{ teacherId: currentUserId }, { learnerId: currentUserId }]
    }
  });

  if (!session) {
    return res.status(404).json({
      message: "La sesion no existe, no esta completada o no tienes acceso."
    });
  }

  const validReviewedId = [session.teacherId, session.learnerId].includes(input.reviewedId);

  if (!validReviewedId) {
    return res.status(400).json({
      message: "La persona valorada no pertenece a esta sesion."
    });
  }

  const review = await prisma.review.create({
    data: {
      sessionId: input.sessionId,
      reviewerId: currentUserId,
      reviewedId: input.reviewedId,
      rating: input.rating,
      comment: input.comment ?? null
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
    message: "Valoracion creada correctamente.",
    valoracion: serializeReview(review)
  });
});

reviewRouter.get("/me", requireAuth, async (req, res) => {
  const currentUserId = req.user!.sub;

  const [recibidas, escritas] = await Promise.all([
    prisma.review.findMany({
      where: {
        reviewedId: currentUserId
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
        reviewerId: currentUserId
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
    valoracionesRecibidas: recibidas.map(serializeReview),
    valoracionesEscritas: escritas.map(serializeReview)
  });
});
