import { DayOfWeek } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import { serializarDisponibilidad } from "../utilidades/serializadores.js";
import { requerirAutenticacion } from "../intermediarios/autenticacion.middleware.js";

export const routerDisponibilidad = Router();

const esquemaDisponibilidad = z.object({
  diaSemana: z.nativeEnum(DayOfWeek),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/u, "La hora de inicio debe tener formato HH:mm."),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/u, "La hora de fin debe tener formato HH:mm.")
});

const esquemaParametrosDisponibilidad = z.object({
  disponibilidadId: z.string().uuid("disponibilidadId debe ser un UUID válido.")
});

function convertirAHoraFecha(valor: string) {
  return new Date(`1970-01-01T${valor}:00.000Z`);
}

function convertirAMinutos(valor: string) {
  const [hours, minutes] = valor.split(":").map(Number);
  return hours * 60 + minutes;
}

routerDisponibilidad.get("/yo", requerirAutenticacion, async (req, res) => {
  const disponibilidades = await prisma.availability.findMany({
    where: {
      userId: req.usuario!.sub
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
  });

  return res.status(200).json({
    disponibilidades: disponibilidades.map(serializarDisponibilidad)
  });
});

routerDisponibilidad.post("/yo", requerirAutenticacion, async (req, res) => {
  const datosEntrada = esquemaDisponibilidad.parse(req.body);

  if (convertirAMinutos(datosEntrada.horaInicio) >= convertirAMinutos(datosEntrada.horaFin)) {
    return res.status(400).json({
      mensaje: "La hora de inicio debe ser anterior a la hora de fin."
    });
  }

  const disponibilidad = await prisma.availability.create({
    data: {
      userId: req.usuario!.sub,
      dayOfWeek: datosEntrada.diaSemana,
      startTime: convertirAHoraFecha(datosEntrada.horaInicio),
      endTime: convertirAHoraFecha(datosEntrada.horaFin)
    }
  });

  return res.status(201).json({
    mensaje: "La disponibilidad se ha guardado correctamente.",
    disponibilidad: serializarDisponibilidad(disponibilidad)
  });
});

routerDisponibilidad.delete("/yo/:disponibilidadId", requerirAutenticacion, async (req, res) => {
  const { disponibilidadId } = esquemaParametrosDisponibilidad.parse(req.params);

  const disponibilidad = await prisma.availability.findFirst({
    where: {
      id: disponibilidadId,
      userId: req.usuario!.sub
    }
  });

  if (!disponibilidad) {
    return res.status(404).json({
      mensaje: "La disponibilidad seleccionada no existe."
    });
  }

  await prisma.availability.delete({
    where: {
      id: disponibilidadId
    }
  });

  return res.status(200).json({
    mensaje: "La disponibilidad se ha eliminado correctamente."
  });
});
