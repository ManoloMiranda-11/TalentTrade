import { DayOfWeek } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { serializeAvailability } from "../lib/serializers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const availabilityRouter = Router();

const availabilitySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z.string().regex(/^\d{2}:\d{2}$/u, "La hora de inicio debe tener formato HH:mm."),
  endTime: z.string().regex(/^\d{2}:\d{2}$/u, "La hora de fin debe tener formato HH:mm.")
});

const paramsSchema = z.object({
  availabilityId: z.string().uuid("availabilityId debe ser un UUID valido.")
});

function toTimeDate(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

availabilityRouter.get("/me", requireAuth, async (req, res) => {
  const slots = await prisma.availability.findMany({
    where: {
      userId: req.user!.sub
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
  });

  return res.status(200).json({
    disponibilidades: slots.map(serializeAvailability)
  });
});

availabilityRouter.post("/me", requireAuth, async (req, res) => {
  const input = availabilitySchema.parse(req.body);

  if (toMinutes(input.startTime) >= toMinutes(input.endTime)) {
    return res.status(400).json({
      message: "La hora de inicio debe ser anterior a la hora de fin."
    });
  }

  const slot = await prisma.availability.create({
    data: {
      userId: req.user!.sub,
      dayOfWeek: input.dayOfWeek,
      startTime: toTimeDate(input.startTime),
      endTime: toTimeDate(input.endTime)
    }
  });

  return res.status(201).json({
    message: "Disponibilidad guardada correctamente.",
    disponibilidad: serializeAvailability(slot)
  });
});

availabilityRouter.delete("/me/:availabilityId", requireAuth, async (req, res) => {
  const { availabilityId } = paramsSchema.parse(req.params);

  const slot = await prisma.availability.findFirst({
    where: {
      id: availabilityId,
      userId: req.user!.sub
    }
  });

  if (!slot) {
    return res.status(404).json({
      message: "La disponibilidad indicada no existe."
    });
  }

  await prisma.availability.delete({
    where: {
      id: availabilityId
    }
  });

  return res.status(200).json({
    message: "Disponibilidad eliminada correctamente."
  });
});
