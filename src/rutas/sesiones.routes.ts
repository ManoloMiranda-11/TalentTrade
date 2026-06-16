import { Router } from "express";
import { SessionStatus } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import { mapearEstadoSesionPrisma, serializarSesion } from "../utilidades/serializadores.js";
import { requerirAutenticacion } from "../intermediarios/autenticacion.middleware.js";

export const routerSesiones = Router();

const esquemaCrearSesion = z.object({
  coincidenciaId: z.string().uuid("coincidenciaId debe ser un UUID válido."),
  habilidadId: z.string().uuid("habilidadId debe ser un UUID válido."),
  profesorId: z.string().uuid("profesorId debe ser un UUID válido."),
  aprendizId: z.string().uuid("aprendizId debe ser un UUID válido."),
  fechaProgramada: z.coerce.date().refine((fecha) => fecha.getTime() > Date.now(), {
    message: "La fecha programada debe ser futura."
  }),
  duracionMinutos: z.number().int().min(15, "La duración mínima es de 15 minutos.").max(480)
});

const esquemaActualizarEstadoSesion = z.object({
  estado: z.enum(["PROGRAMADA", "COMPLETADA", "CANCELADA"])
});

const esquemaParametrosSesion = z.object({
  sesionId: z.string().uuid("sesionId debe ser un UUID válido.")
});

const RESUMEN_USUARIO_SESION = {
  select: {
    id: true,
    name: true,
    avatarUrl: true,
    city: true
  }
} as const;

const INCLUDE_SESION_COMPLETA = {
  match: {
    select: {
      id: true,
      status: true
    }
  },
  skillTaught: true,
  teacher: RESUMEN_USUARIO_SESION,
  learner: RESUMEN_USUARIO_SESION
} as const;

routerSesiones.post("/", requerirAutenticacion, async (req, res) => {
  const datosEntrada = esquemaCrearSesion.parse(req.body);
  const usuarioActualId = req.usuario!.sub;

  const coincidencia = await prisma.match.findFirst({
    where: {
      id: datosEntrada.coincidenciaId,
      status: "ACCEPTED",
      OR: [{ requesterId: usuarioActualId }, { receiverId: usuarioActualId }]
    }
  });

  if (!coincidencia) {
    return res.status(404).json({
      mensaje: "La coincidencia no existe o todavía no está aceptada."
    });
  }

  const idsParticipantes = [coincidencia.requesterId, coincidencia.receiverId];

  if (!idsParticipantes.includes(datosEntrada.profesorId) || !idsParticipantes.includes(datosEntrada.aprendizId)) {
    return res.status(400).json({
      mensaje: "Profesor y aprendiz deben pertenecer a la coincidencia."
    });
  }

  if (datosEntrada.profesorId === datosEntrada.aprendizId) {
    return res.status(400).json({
      mensaje: "Profesor y aprendiz no pueden ser la misma persona."
    });
  }

  const [habilidadProfesor, interesAprendiz] = await Promise.all([
    prisma.userSkill.findFirst({
      where: {
        userId: datosEntrada.profesorId,
        skillId: datosEntrada.habilidadId,
        type: "OFFER"
      }
    }),
    prisma.userSkill.findFirst({
      where: {
        userId: datosEntrada.aprendizId,
        skillId: datosEntrada.habilidadId,
        type: "WANT"
      }
    })
  ]);

  if (!habilidadProfesor || !interesAprendiz) {
    return res.status(400).json({
      mensaje: "La habilidad elegida no encaja con el intercambio entre ambos usuarios."
    });
  }

  const sesion = await prisma.session.create({
    data: {
      matchId: datosEntrada.coincidenciaId,
      skillTaughtId: datosEntrada.habilidadId,
      teacherId: datosEntrada.profesorId,
      learnerId: datosEntrada.aprendizId,
      scheduledAt: datosEntrada.fechaProgramada,
      durationMinutes: datosEntrada.duracionMinutos
    },
    include: INCLUDE_SESION_COMPLETA
  });

  return res.status(201).json({
    mensaje: "La sesión se ha creado correctamente.",
    sesion: serializarSesion(sesion)
  });
});

routerSesiones.get("/yo", requerirAutenticacion, async (req, res) => {
  const usuarioActualId = req.usuario!.sub;

  const sesiones = await prisma.session.findMany({
    where: {
      OR: [{ teacherId: usuarioActualId }, { learnerId: usuarioActualId }]
    },
    include: INCLUDE_SESION_COMPLETA,
    orderBy: {
      scheduledAt: "asc"
    }
  });

  const sesionesSerializadas = sesiones.map(serializarSesion);

  return res.status(200).json({
    sesiones: sesionesSerializadas,
    agrupadas: {
      programadas: sesionesSerializadas.filter((sesion) => sesion.estado === "PROGRAMADA"),
      completadas: sesionesSerializadas.filter((sesion) => sesion.estado === "COMPLETADA"),
      canceladas: sesionesSerializadas.filter((sesion) => sesion.estado === "CANCELADA")
    }
  });
});

routerSesiones.patch("/:sesionId/estado", requerirAutenticacion, async (req, res) => {
  const { sesionId } = esquemaParametrosSesion.parse(req.params);
  const { estado: estadoEntrada } = esquemaActualizarEstadoSesion.parse(req.body);
  const estado = mapearEstadoSesionPrisma(estadoEntrada);
  const usuarioActualId = req.usuario!.sub;

  const sesion = await prisma.session.findFirst({
    where: {
      id: sesionId,
      OR: [{ teacherId: usuarioActualId }, { learnerId: usuarioActualId }]
    },
    include: INCLUDE_SESION_COMPLETA
  });

  if (!sesion) {
    return res.status(404).json({
      mensaje: "La sesión indicada no existe."
    });
  }

  if (sesion.status === SessionStatus.CANCELLED) {
    return res.status(400).json({
      mensaje: "La sesión ya está cancelada."
    });
  }

  const sesionActualizada = await prisma.session.update({
    where: {
      id: sesionId
    },
    data: {
      status: estado
    },
    include: INCLUDE_SESION_COMPLETA
  });

  return res.status(200).json({
    mensaje: "El estado de la sesión se ha actualizado correctamente.",
    sesion: serializarSesion(sesionActualizada)
  });
});
