import { MatchStatus, type UserSkill } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import {
  mapearEstadoCoincidenciaPrisma,
  serializarCoincidencia,
  serializarHabilidad
} from "../utilidades/serializadores.js";
import { requerirAutenticacion } from "../intermediarios/autenticacion.middleware.js";

export const routerCoincidencias = Router();

const esquemaCrearCoincidencia = z.object({
  receptorId: z.string().uuid("receptorId debe ser un UUID valido."),
  habilidadOfrecidaId: z.string().uuid("habilidadOfrecidaId debe ser un UUID valido."),
  habilidadDeseadaId: z.string().uuid("habilidadDeseadaId debe ser un UUID valido.")
});

const esquemaActualizarEstadoCoincidencia = z.object({
  estado: z.enum(["ACEPTADA", "RECHAZADA", "CANCELADA"])
});

const esquemaParametrosCoincidencia = z.object({
  coincidenciaId: z.string().uuid("coincidenciaId debe ser un UUID valido.")
});

function construirSugerenciasCompatibles(parametros: {
  usuarioActualId: string;
  habilidadesOfrecidas: (UserSkill & {
    skill: {
      id: string;
      name: string;
      category: string | null;
      icon: string | null;
    };
  })[];
  habilidadesDeseadas: (UserSkill & {
    skill: {
      id: string;
      name: string;
      category: string | null;
      icon: string | null;
    };
  })[];
  usuariosCandidatos: {
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
  clavesExistentes: Set<string>;
}) {
  const { usuarioActualId, habilidadesOfrecidas, habilidadesDeseadas, usuariosCandidatos, clavesExistentes } =
    parametros;

  return usuariosCandidatos.flatMap((candidato) => {
    const habilidadesQueOfrece = candidato.userSkills.filter((habilidadCandidato) =>
      habilidadesDeseadas.some(
        (habilidadDeseada) => habilidadDeseada.skillId === habilidadCandidato.skillId && habilidadCandidato.type === "OFFER"
      )
    );

    const habilidadesQueQuiere = candidato.userSkills.filter((habilidadCandidato) =>
      habilidadesOfrecidas.some(
        (habilidadOfrecida) => habilidadOfrecida.skillId === habilidadCandidato.skillId && habilidadCandidato.type === "WANT"
      )
    );

    return habilidadesQueOfrece.flatMap((habilidadQueOfrece) =>
      habilidadesQueQuiere
        .filter(
          (habilidadQueQuiere) =>
            !clavesExistentes.has(
              `${usuarioActualId}:${candidato.id}:${habilidadQueQuiere.skillId}:${habilidadQueOfrece.skillId}`
            )
        )
        .map((habilidadQueQuiere) => {
          const habilidadOfrecidaPorUsuario = habilidadesOfrecidas.find(
            (habilidadOfrecida) => habilidadOfrecida.skillId === habilidadQueQuiere.skillId
          );
          const habilidadDeseadaPorUsuario = habilidadesDeseadas.find(
            (habilidadDeseada) => habilidadDeseada.skillId === habilidadQueOfrece.skillId
          );

          return {
            usuario: {
              id: candidato.id,
              nombre: candidato.name,
              urlAvatar: candidato.avatarUrl,
              ciudad: candidato.city,
              biografia: candidato.bio
            },
            compatibilidad: {
              habilidadOfrecidaPorSolicitante: serializarHabilidad(
                habilidadOfrecidaPorUsuario?.skill ?? habilidadQueQuiere.skill
              ),
              habilidadDeseadaPorSolicitante: serializarHabilidad(
                habilidadDeseadaPorUsuario?.skill ?? habilidadQueOfrece.skill
              ),
              habilidadOfrecidaPorCandidato: serializarHabilidad(habilidadQueOfrece.skill),
              habilidadDeseadaPorCandidato: serializarHabilidad(habilidadQueQuiere.skill)
            }
          };
        })
    );
  });
}

routerCoincidencias.get("/descubrir", requerirAutenticacion, async (req, res) => {
  const usuarioActualId = req.usuario!.sub;

  const habilidadesUsuarioActual = await prisma.userSkill.findMany({
    where: {
      userId: usuarioActualId
    },
    include: {
      skill: true
    }
  });

  const habilidadesOfrecidas = habilidadesUsuarioActual.filter((habilidadUsuario) => habilidadUsuario.type === "OFFER");
  const habilidadesDeseadas = habilidadesUsuarioActual.filter((habilidadUsuario) => habilidadUsuario.type === "WANT");

  if (habilidadesOfrecidas.length === 0 || habilidadesDeseadas.length === 0) {
    return res.status(200).json({
      coincidencias: [],
      mensaje: "Necesitas indicar al menos una habilidad que ofreces y otra que quieres aprender."
    });
  }

  const idsHabilidadesOfrecidas = habilidadesOfrecidas.map((habilidadUsuario) => habilidadUsuario.skillId);
  const idsHabilidadesDeseadas = habilidadesDeseadas.map((habilidadUsuario) => habilidadUsuario.skillId);

  const usuariosCandidatos = await prisma.user.findMany({
    where: {
      id: {
        not: usuarioActualId
      },
      userSkills: {
        some: {
          type: "OFFER",
          skillId: {
            in: idsHabilidadesDeseadas
          }
        }
      },
      AND: [
        {
          userSkills: {
            some: {
              type: "WANT",
              skillId: {
                in: idsHabilidadesOfrecidas
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

  const coincidenciasExistentes = await prisma.match.findMany({
    where: {
      OR: [
        { requesterId: usuarioActualId },
        { receiverId: usuarioActualId }
      ]
    },
    select: {
      requesterId: true,
      receiverId: true,
      requesterOfferSkillId: true,
      requesterWantSkillId: true
    }
  });

  const clavesExistentes = new Set(
    coincidenciasExistentes.flatMap((coincidencia) => [
      `${coincidencia.requesterId}:${coincidencia.receiverId}:${coincidencia.requesterOfferSkillId}:${coincidencia.requesterWantSkillId}`,
      `${coincidencia.receiverId}:${coincidencia.requesterId}:${coincidencia.requesterWantSkillId}:${coincidencia.requesterOfferSkillId}`
    ])
  );

  const sugerencias = construirSugerenciasCompatibles({
    usuarioActualId,
    habilidadesOfrecidas,
    habilidadesDeseadas,
    usuariosCandidatos,
    clavesExistentes
  });

  return res.status(200).json({
    coincidencias: sugerencias
  });
});

routerCoincidencias.get("/yo", requerirAutenticacion, async (req, res) => {
  const usuarioActualId = req.usuario!.sub;

  const coincidencias = await prisma.match.findMany({
    where: {
      OR: [{ requesterId: usuarioActualId }, { receiverId: usuarioActualId }]
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

  const coincidenciasSerializadas = coincidencias.map(serializarCoincidencia);

  return res.status(200).json({
    coincidencias: coincidenciasSerializadas,
    agrupadas: {
      pendientes: coincidenciasSerializadas.filter((coincidencia) => coincidencia.estado === "PENDIENTE"),
      aceptadas: coincidenciasSerializadas.filter((coincidencia) => coincidencia.estado === "ACEPTADA"),
      rechazadas: coincidenciasSerializadas.filter((coincidencia) => coincidencia.estado === "RECHAZADA"),
      canceladas: coincidenciasSerializadas.filter((coincidencia) => coincidencia.estado === "CANCELADA")
    }
  });
});

routerCoincidencias.post("/", requerirAutenticacion, async (req, res) => {
  const datosEntrada = esquemaCrearCoincidencia.parse(req.body);
  const solicitanteId = req.usuario!.sub;

  if (datosEntrada.receptorId === solicitanteId) {
    return res.status(400).json({
      mensaje: "No puedes crear una coincidencia contigo mismo."
    });
  }

  const [receptor, habilidadOfrecidaPorSolicitante, habilidadDeseadaPorSolicitante] = await Promise.all([
    prisma.user.findUnique({
      where: { id: datosEntrada.receptorId },
      select: { id: true }
    }),
    prisma.userSkill.findFirst({
      where: {
        userId: solicitanteId,
        skillId: datosEntrada.habilidadOfrecidaId,
        type: "OFFER"
      }
    }),
    prisma.userSkill.findFirst({
      where: {
        userId: solicitanteId,
        skillId: datosEntrada.habilidadDeseadaId,
        type: "WANT"
      }
    })
  ]);

  if (!receptor) {
    return res.status(404).json({
      mensaje: "La persona seleccionada no existe."
    });
  }

  if (!habilidadOfrecidaPorSolicitante || !habilidadDeseadaPorSolicitante) {
    return res.status(400).json({
      mensaje: "Debes seleccionar una habilidad que ofreces y otra que quieres aprender."
    });
  }

  const compatibilidadReceptor = await prisma.userSkill.findMany({
    where: {
      userId: datosEntrada.receptorId,
      OR: [
        {
          skillId: datosEntrada.habilidadDeseadaId,
          type: "OFFER"
        },
        {
          skillId: datosEntrada.habilidadOfrecidaId,
          type: "WANT"
        }
      ]
    }
  });

  const receptorOfreceHabilidadDeseada = compatibilidadReceptor.some(
    (habilidadUsuario) => habilidadUsuario.skillId === datosEntrada.habilidadDeseadaId && habilidadUsuario.type === "OFFER"
  );
  const receptorQuiereHabilidadOfrecida = compatibilidadReceptor.some(
    (habilidadUsuario) => habilidadUsuario.skillId === datosEntrada.habilidadOfrecidaId && habilidadUsuario.type === "WANT"
  );

  if (!receptorOfreceHabilidadDeseada || !receptorQuiereHabilidadOfrecida) {
    return res.status(400).json({
      mensaje: "El usuario seleccionado ya no tiene una compatibilidad valida para este intercambio."
    });
  }

  const coincidenciaExistente = await prisma.match.findFirst({
    where: {
      OR: [
        {
          requesterId: solicitanteId,
          receiverId: datosEntrada.receptorId,
          requesterOfferSkillId: datosEntrada.habilidadOfrecidaId,
          requesterWantSkillId: datosEntrada.habilidadDeseadaId
        },
        {
          requesterId: datosEntrada.receptorId,
          receiverId: solicitanteId,
          requesterOfferSkillId: datosEntrada.habilidadDeseadaId,
          requesterWantSkillId: datosEntrada.habilidadOfrecidaId
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

  if (coincidenciaExistente) {
    return res.status(409).json({
      mensaje: "Ya existe una coincidencia para este intercambio.",
      coincidencia: serializarCoincidencia(coincidenciaExistente)
    });
  }

  const coincidencia = await prisma.match.create({
    data: {
      requesterId: solicitanteId,
      receiverId: datosEntrada.receptorId,
      requesterOfferSkillId: datosEntrada.habilidadOfrecidaId,
      requesterWantSkillId: datosEntrada.habilidadDeseadaId
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
    mensaje: "Solicitud de intercambio creada correctamente.",
    coincidencia: serializarCoincidencia(coincidencia)
  });
});

routerCoincidencias.patch("/:coincidenciaId/estado", requerirAutenticacion, async (req, res) => {
  const { coincidenciaId } = esquemaParametrosCoincidencia.parse(req.params);
  const { estado: estadoEntrada } = esquemaActualizarEstadoCoincidencia.parse(req.body);
  const estado = mapearEstadoCoincidenciaPrisma(estadoEntrada);
  const usuarioActualId = req.usuario!.sub;

  const coincidenciaExistente = await prisma.match.findUnique({
    where: { id: coincidenciaId },
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

  if (!coincidenciaExistente) {
    return res.status(404).json({
      mensaje: "La coincidencia indicada no existe."
    });
  }

  if (coincidenciaExistente.receiverId !== usuarioActualId && coincidenciaExistente.requesterId !== usuarioActualId) {
    return res.status(403).json({
      mensaje: "No tienes permisos para gestionar esta coincidencia."
    });
  }

  if (estado === MatchStatus.ACCEPTED && coincidenciaExistente.receiverId !== usuarioActualId) {
    return res.status(403).json({
      mensaje: "Solo la persona que recibe la solicitud puede aceptarla."
    });
  }

  if (coincidenciaExistente.status === MatchStatus.REJECTED || coincidenciaExistente.status === MatchStatus.CANCELLED) {
    return res.status(400).json({
      mensaje: "Esta coincidencia ya no puede modificarse."
    });
  }

  if (coincidenciaExistente.status === MatchStatus.ACCEPTED && estado === MatchStatus.ACCEPTED) {
    return res.status(200).json({
      mensaje: "La coincidencia ya estaba aceptada.",
      coincidencia: serializarCoincidencia(coincidenciaExistente)
    });
  }

  const coincidenciaActualizada = await prisma.$transaction(async (transaccion) => {
    const coincidencia = await transaccion.match.update({
      where: { id: coincidenciaId },
      data: { status: estado },
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

    if (estado === MatchStatus.ACCEPTED && !coincidencia.conversation) {
      await transaccion.conversation.create({
        data: {
          matchId: coincidencia.id
        }
      });

      return transaccion.match.findUniqueOrThrow({
        where: { id: coincidencia.id },
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

    return coincidencia;
  });

  return res.status(200).json({
    mensaje: "Estado de la coincidencia actualizado correctamente.",
    coincidencia: serializarCoincidencia(coincidenciaActualizada)
  });
});
