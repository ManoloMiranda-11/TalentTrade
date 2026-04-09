import { Router } from "express";
import { SkillLevel, UserSkillType } from "@prisma/client";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { serializeUserSkill } from "../lib/serializers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const skillRouter = Router();

const assignSkillSchema = z.object({
  skillId: z.string().uuid("skillId debe ser un UUID valido."),
  type: z.nativeEnum(UserSkillType),
  level: z.nativeEnum(SkillLevel)
});

skillRouter.get("/", async (_req, res) => {
  const skills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });

  return res.status(200).json({
    skills
  });
});

skillRouter.post("/me", requireAuth, async (req, res) => {
  const input = assignSkillSchema.parse(req.body);

  const skill = await prisma.skill.findUnique({
    where: { id: input.skillId }
  });

  if (!skill) {
    return res.status(404).json({
      message: "La habilidad indicada no existe."
    });
  }

  const userSkill = await prisma.userSkill.upsert({
    where: {
      userId_skillId_type: {
        userId: req.user!.sub,
        skillId: input.skillId,
        type: input.type
      }
    },
    update: {
      level: input.level
    },
    create: {
      userId: req.user!.sub,
      skillId: input.skillId,
      type: input.type,
      level: input.level
    },
    include: {
      skill: true
    }
  });

  return res.status(200).json({
    message: "Habilidad guardada correctamente.",
    userSkill: serializeUserSkill(userSkill)
  });
});

skillRouter.delete("/me/:userSkillId", requireAuth, async (req, res) => {
  const paramsSchema = z.object({
    userSkillId: z.string().uuid("userSkillId debe ser un UUID valido.")
  });

  const { userSkillId } = paramsSchema.parse(req.params);

  const existingUserSkill = await prisma.userSkill.findFirst({
    where: {
      id: userSkillId,
      userId: req.user!.sub
    }
  });

  if (!existingUserSkill) {
    return res.status(404).json({
      message: "La habilidad del usuario no existe."
    });
  }

  await prisma.userSkill.delete({
    where: {
      id: userSkillId
    }
  });

  return res.status(200).json({
    message: "Habilidad eliminada correctamente."
  });
});
