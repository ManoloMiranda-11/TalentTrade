import { Router } from "express";
import { SessionStatus } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { serializeSession } from "../lib/serializers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const sessionRouter = Router();

const createSessionSchema = z.object({
  matchId: z.string().uuid("matchId debe ser un UUID valido."),
  skillTaughtId: z.string().uuid("skillTaughtId debe ser un UUID valido."),
  teacherId: z.string().uuid("teacherId debe ser un UUID valido."),
  learnerId: z.string().uuid("learnerId debe ser un UUID valido."),
  scheduledAt: z.coerce.date(),
  durationMinutes: z.number().int().min(15, "La duracion minima es de 15 minutos.").max(480)
});

const updateSessionStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"])
});

const sessionParamsSchema = z.object({
  sessionId: z.string().uuid("sessionId debe ser un UUID valido.")
});

sessionRouter.post("/", requireAuth, async (req, res) => {
  const input = createSessionSchema.parse(req.body);
  const currentUserId = req.user!.sub;

  const match = await prisma.match.findFirst({
    where: {
      id: input.matchId,
      status: "ACCEPTED",
      OR: [{ requesterId: currentUserId }, { receiverId: currentUserId }]
    }
  });

  if (!match) {
    return res.status(404).json({
      message: "La coincidencia no existe o no esta aceptada."
    });
  }

  const participantIds = [match.requesterId, match.receiverId];

  if (!participantIds.includes(input.teacherId) || !participantIds.includes(input.learnerId)) {
    return res.status(400).json({
      message: "Profesor y aprendiz deben pertenecer a la coincidencia."
    });
  }

  if (input.teacherId === input.learnerId) {
    return res.status(400).json({
      message: "Profesor y aprendiz no pueden ser la misma persona."
    });
  }

  const [teacherSkill, learnerInterest] = await Promise.all([
    prisma.userSkill.findFirst({
      where: {
        userId: input.teacherId,
        skillId: input.skillTaughtId,
        type: "OFFER"
      }
    }),
    prisma.userSkill.findFirst({
      where: {
        userId: input.learnerId,
        skillId: input.skillTaughtId,
        type: "WANT"
      }
    })
  ]);

  if (!teacherSkill || !learnerInterest) {
    return res.status(400).json({
      message: "La habilidad elegida no encaja con el intercambio entre ambos usuarios."
    });
  }

  const session = await prisma.session.create({
    data: input,
    include: {
      match: {
        select: {
          id: true,
          status: true
        }
      },
      skillTaught: true,
      teacher: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      learner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      }
    }
  });

  return res.status(201).json({
    message: "Sesion creada correctamente.",
    sesion: serializeSession(session)
  });
});

sessionRouter.get("/me", requireAuth, async (req, res) => {
  const currentUserId = req.user!.sub;

  const sessions = await prisma.session.findMany({
    where: {
      OR: [{ teacherId: currentUserId }, { learnerId: currentUserId }]
    },
    include: {
      match: {
        select: {
          id: true,
          status: true
        }
      },
      skillTaught: true,
      teacher: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      learner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      }
    },
    orderBy: {
      scheduledAt: "asc"
    }
  });

  const serializedSessions = sessions.map(serializeSession);

  return res.status(200).json({
    sesiones: serializedSessions,
    agrupadas: {
      programadas: serializedSessions.filter((session) => session.estado === "SCHEDULED"),
      completadas: serializedSessions.filter((session) => session.estado === "COMPLETED"),
      canceladas: serializedSessions.filter((session) => session.estado === "CANCELLED")
    }
  });
});

sessionRouter.patch("/:sessionId/status", requireAuth, async (req, res) => {
  const { sessionId } = sessionParamsSchema.parse(req.params);
  const { status } = updateSessionStatusSchema.parse(req.body);
  const currentUserId = req.user!.sub;

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      OR: [{ teacherId: currentUserId }, { learnerId: currentUserId }]
    },
    include: {
      match: {
        select: {
          id: true,
          status: true
        }
      },
      skillTaught: true,
      teacher: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      learner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      }
    }
  });

  if (!session) {
    return res.status(404).json({
      message: "La sesion no existe."
    });
  }

  if (session.status === SessionStatus.CANCELLED) {
    return res.status(400).json({
      message: "La sesion ya esta cancelada."
    });
  }

  const updatedSession = await prisma.session.update({
    where: {
      id: sessionId
    },
    data: {
      status
    },
    include: {
      match: {
        select: {
          id: true,
          status: true
        }
      },
      skillTaught: true,
      teacher: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      learner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      }
    }
  });

  return res.status(200).json({
    message: "Estado de la sesion actualizado correctamente.",
    sesion: serializeSession(updatedSession)
  });
});
