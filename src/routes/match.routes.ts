import { MatchStatus, type UserSkill } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { serializeMatch } from "../lib/serializers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const matchRouter = Router();

const createMatchSchema = z.object({
  receiverId: z.string().uuid("receiverId debe ser un UUID valido."),
  requesterOfferSkillId: z.string().uuid("requesterOfferSkillId debe ser un UUID valido."),
  requesterWantSkillId: z.string().uuid("requesterWantSkillId debe ser un UUID valido.")
});

const updateMatchStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "CANCELLED"])
});

const matchParamsSchema = z.object({
  matchId: z.string().uuid("matchId debe ser un UUID valido.")
});

function buildCompatibilitySuggestions(params: {
  currentUserId: string;
  offeredSkills: (UserSkill & {
    skill: {
      id: string;
      name: string;
      category: string | null;
      icon: string | null;
    };
  })[];
  wantedSkills: (UserSkill & {
    skill: {
      id: string;
      name: string;
      category: string | null;
      icon: string | null;
    };
  })[];
  candidateUsers: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
    bio: string | null;
    userSkills: (UserSkill & {
      skill: {
        id: string;
        name: string;
        category: string | null;
        icon: string | null;
      };
    })[];
  }[];
  existingKeys: Set<string>;
}) {
  const { currentUserId, offeredSkills, wantedSkills, candidateUsers, existingKeys } = params;

  return candidateUsers.flatMap((candidate) => {
    const candidateOffers = candidate.userSkills.filter((skill) =>
      wantedSkills.some((wanted) => wanted.skillId === skill.skillId && skill.type === "OFFER")
    );

    const candidateWants = candidate.userSkills.filter((skill) =>
      offeredSkills.some((offered) => offered.skillId === skill.skillId && skill.type === "WANT")
    );

    return candidateOffers.flatMap((candidateOffer) =>
      candidateWants
        .filter(
          (candidateWant) =>
            !existingKeys.has(
              `${currentUserId}:${candidate.id}:${candidateWant.skillId}:${candidateOffer.skillId}`
            )
        )
        .map((candidateWant) => {
          const currentUserOffer = offeredSkills.find((skill) => skill.skillId === candidateWant.skillId);
          const currentUserWant = wantedSkills.find((skill) => skill.skillId === candidateOffer.skillId);

          return {
            user: {
              id: candidate.id,
              name: candidate.name,
              avatarUrl: candidate.avatarUrl,
              city: candidate.city,
              bio: candidate.bio
            },
            compatibility: {
              requesterOfferSkill: currentUserOffer?.skill ?? candidateWant.skill,
              requesterWantSkill: currentUserWant?.skill ?? candidateOffer.skill,
              candidateOfferSkill: candidateOffer.skill,
              candidateWantSkill: candidateWant.skill
            }
          };
        })
    );
  });
}

matchRouter.get("/discover", requireAuth, async (req, res) => {
  const currentUserId = req.user!.sub;

  const currentUserSkills = await prisma.userSkill.findMany({
    where: {
      userId: currentUserId
    },
    include: {
      skill: true
    }
  });

  const offeredSkills = currentUserSkills.filter((item) => item.type === "OFFER");
  const wantedSkills = currentUserSkills.filter((item) => item.type === "WANT");

  if (offeredSkills.length === 0 || wantedSkills.length === 0) {
    return res.status(200).json({
      matches: [],
      message: "Necesitas indicar al menos una habilidad que ofreces y otra que quieres aprender."
    });
  }

  const offeredSkillIds = offeredSkills.map((item) => item.skillId);
  const wantedSkillIds = wantedSkills.map((item) => item.skillId);

  const candidateUsers = await prisma.user.findMany({
    where: {
      id: {
        not: currentUserId
      },
      userSkills: {
        some: {
          type: "OFFER",
          skillId: {
            in: wantedSkillIds
          }
        }
      },
      AND: [
        {
          userSkills: {
            some: {
              type: "WANT",
              skillId: {
                in: offeredSkillIds
              }
            }
          }
        }
      ]
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      city: true,
      bio: true,
      userSkills: {
        include: {
          skill: true
        }
      }
    }
  });

  const existingMatches = await prisma.match.findMany({
    where: {
      OR: [
        { requesterId: currentUserId },
        { receiverId: currentUserId }
      ]
    },
    select: {
      requesterId: true,
      receiverId: true,
      requesterOfferSkillId: true,
      requesterWantSkillId: true
    }
  });

  const existingKeys = new Set(
    existingMatches.flatMap((match) => [
      `${match.requesterId}:${match.receiverId}:${match.requesterOfferSkillId}:${match.requesterWantSkillId}`,
      `${match.receiverId}:${match.requesterId}:${match.requesterWantSkillId}:${match.requesterOfferSkillId}`
    ])
  );

  const suggestions = buildCompatibilitySuggestions({
    currentUserId,
    offeredSkills,
    wantedSkills,
    candidateUsers,
    existingKeys
  });

  return res.status(200).json({
    coincidencias: suggestions
  });
});

matchRouter.get("/me", requireAuth, async (req, res) => {
  const currentUserId = req.user!.sub;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ requesterId: currentUserId }, { receiverId: currentUserId }]
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      requesterOfferSkill: true,
      requesterWantSkill: true,
      conversation: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const serializedMatches = matches.map(serializeMatch);

  return res.status(200).json({
    coincidencias: serializedMatches,
    agrupadas: {
      pendientes: serializedMatches.filter((match) => match.estado === "PENDING"),
      aceptadas: serializedMatches.filter((match) => match.estado === "ACCEPTED"),
      rechazadas: serializedMatches.filter((match) => match.estado === "REJECTED"),
      canceladas: serializedMatches.filter((match) => match.estado === "CANCELLED")
    }
  });
});

matchRouter.post("/", requireAuth, async (req, res) => {
  const input = createMatchSchema.parse(req.body);
  const requesterId = req.user!.sub;

  if (input.receiverId === requesterId) {
    return res.status(400).json({
      message: "No puedes crear un match contigo mismo."
    });
  }

  const [receiver, requesterOffer, requesterWant] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.receiverId },
      select: { id: true }
    }),
    prisma.userSkill.findFirst({
      where: {
        userId: requesterId,
        skillId: input.requesterOfferSkillId,
        type: "OFFER"
      }
    }),
    prisma.userSkill.findFirst({
      where: {
        userId: requesterId,
        skillId: input.requesterWantSkillId,
        type: "WANT"
      }
    })
  ]);

  if (!receiver) {
    return res.status(404).json({
      message: "El usuario receptor no existe."
    });
  }

  if (!requesterOffer || !requesterWant) {
    return res.status(400).json({
      message: "Debes seleccionar una habilidad que ofreces y otra que quieres aprender."
    });
  }

  const receiverCompatibility = await prisma.userSkill.findMany({
    where: {
      userId: input.receiverId,
      OR: [
        {
          skillId: input.requesterWantSkillId,
          type: "OFFER"
        },
        {
          skillId: input.requesterOfferSkillId,
          type: "WANT"
        }
      ]
    }
  });

  const receiverOffersRequestedSkill = receiverCompatibility.some(
    (item) => item.skillId === input.requesterWantSkillId && item.type === "OFFER"
  );
  const receiverWantsRequesterSkill = receiverCompatibility.some(
    (item) => item.skillId === input.requesterOfferSkillId && item.type === "WANT"
  );

  if (!receiverOffersRequestedSkill || !receiverWantsRequesterSkill) {
    return res.status(400).json({
      message: "El usuario seleccionado ya no tiene una compatibilidad valida para este intercambio."
    });
  }

  const existingMatch = await prisma.match.findFirst({
    where: {
      OR: [
        {
          requesterId,
          receiverId: input.receiverId,
          requesterOfferSkillId: input.requesterOfferSkillId,
          requesterWantSkillId: input.requesterWantSkillId
        },
        {
          requesterId: input.receiverId,
          receiverId: requesterId,
          requesterOfferSkillId: input.requesterWantSkillId,
          requesterWantSkillId: input.requesterOfferSkillId
        }
      ]
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      requesterOfferSkill: true,
      requesterWantSkill: true,
      conversation: true
    }
  });

  if (existingMatch) {
    return res.status(409).json({
      message: "Ya existe un match para este intercambio.",
      coincidencia: serializeMatch(existingMatch)
    });
  }

  const match = await prisma.match.create({
    data: {
      requesterId,
      receiverId: input.receiverId,
      requesterOfferSkillId: input.requesterOfferSkillId,
      requesterWantSkillId: input.requesterWantSkillId
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      requesterOfferSkill: true,
      requesterWantSkill: true,
      conversation: true
    }
  });

  return res.status(201).json({
    message: "Solicitud de intercambio creada correctamente.",
    coincidencia: serializeMatch(match)
  });
});

matchRouter.patch("/:matchId/status", requireAuth, async (req, res) => {
  const { matchId } = matchParamsSchema.parse(req.params);
  const { status } = updateMatchStatusSchema.parse(req.body);
  const currentUserId = req.user!.sub;

  const existingMatch = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          city: true
        }
      },
      requesterOfferSkill: true,
      requesterWantSkill: true,
      conversation: true
    }
  });

  if (!existingMatch) {
    return res.status(404).json({
      message: "El match no existe."
    });
  }

  if (existingMatch.receiverId !== currentUserId && existingMatch.requesterId !== currentUserId) {
    return res.status(403).json({
      message: "No tienes permisos sobre este match."
    });
  }

  if (status === MatchStatus.ACCEPTED && existingMatch.receiverId !== currentUserId) {
    return res.status(403).json({
      message: "Solo el receptor del match puede aceptarlo."
    });
  }

  if (existingMatch.status === MatchStatus.REJECTED || existingMatch.status === MatchStatus.CANCELLED) {
    return res.status(400).json({
      message: "Este match ya no puede modificarse."
    });
  }

  if (existingMatch.status === MatchStatus.ACCEPTED && status === MatchStatus.ACCEPTED) {
    return res.status(200).json({
      message: "La coincidencia ya estaba aceptada.",
      coincidencia: serializeMatch(existingMatch)
    });
  }

  const updatedMatch = await prisma.$transaction(async (tx) => {
    const match = await tx.match.update({
      where: { id: matchId },
      data: { status },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            city: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            city: true
          }
        },
        requesterOfferSkill: true,
        requesterWantSkill: true,
        conversation: true
      }
    });

    if (status === MatchStatus.ACCEPTED && !match.conversation) {
      await tx.conversation.create({
        data: {
          matchId: match.id
        }
      });

      return tx.match.findUniqueOrThrow({
        where: { id: match.id },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              city: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              city: true
            }
          },
          requesterOfferSkill: true,
          requesterWantSkill: true,
          conversation: true
        }
      });
    }

    return match;
  });

  return res.status(200).json({
    message: "Estado de la coincidencia actualizado correctamente.",
    coincidencia: serializeMatch(updatedMatch)
  });
});
