import { MatchStatus, SessionStatus, SkillLevel, UserSkillType } from "@prisma/client";

export type TipoHabilidadApi = "OFRECER" | "APRENDER";
export type NivelHabilidadApi = "INICIAL" | "MEDIO" | "AVANZADO";
export type EstadoCoincidenciaApi = "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA";
export type EstadoSesionApi = "PROGRAMADA" | "COMPLETADA" | "CANCELADA";

export function mapearTipoHabilidadApi(tipo: UserSkillType): TipoHabilidadApi {
  if (tipo === UserSkillType.OFFER) {
    return "OFRECER";
  }

  return "APRENDER";
}

export function mapearTipoHabilidadPrisma(tipo: TipoHabilidadApi): UserSkillType {
  if (tipo === "OFRECER") {
    return UserSkillType.OFFER;
  }

  return UserSkillType.WANT;
}

export function mapearNivelHabilidadApi(nivel: SkillLevel): NivelHabilidadApi {
  if (nivel === SkillLevel.BEGINNER) {
    return "INICIAL";
  }

  if (nivel === SkillLevel.INTERMEDIATE) {
    return "MEDIO";
  }

  return "AVANZADO";
}

export function mapearNivelHabilidadPrisma(nivel: NivelHabilidadApi): SkillLevel {
  if (nivel === "INICIAL") {
    return SkillLevel.BEGINNER;
  }

  if (nivel === "MEDIO") {
    return SkillLevel.INTERMEDIATE;
  }

  return SkillLevel.ADVANCED;
}

export function mapearEstadoCoincidenciaApi(estado: MatchStatus): EstadoCoincidenciaApi {
  if (estado === MatchStatus.PENDING) {
    return "PENDIENTE";
  }

  if (estado === MatchStatus.ACCEPTED) {
    return "ACEPTADA";
  }

  if (estado === MatchStatus.REJECTED) {
    return "RECHAZADA";
  }

  return "CANCELADA";
}

export function mapearEstadoCoincidenciaPrisma(estado: EstadoCoincidenciaApi): MatchStatus {
  if (estado === "PENDIENTE") {
    return MatchStatus.PENDING;
  }

  if (estado === "ACEPTADA") {
    return MatchStatus.ACCEPTED;
  }

  if (estado === "RECHAZADA") {
    return MatchStatus.REJECTED;
  }

  return MatchStatus.CANCELLED;
}

export function mapearEstadoSesionApi(estado: SessionStatus): EstadoSesionApi {
  if (estado === SessionStatus.SCHEDULED) {
    return "PROGRAMADA";
  }

  if (estado === SessionStatus.COMPLETED) {
    return "COMPLETADA";
  }

  return "CANCELADA";
}

export function mapearEstadoSesionPrisma(estado: EstadoSesionApi): SessionStatus {
  if (estado === "PROGRAMADA") {
    return SessionStatus.SCHEDULED;
  }

  if (estado === "COMPLETADA") {
    return SessionStatus.COMPLETED;
  }

  return SessionStatus.CANCELLED;
}

type HabilidadUsuarioConHabilidad = {
  id: string;
  type: UserSkillType;
  level: SkillLevel;
  createdAt: Date;
  skill: {
    id: string;
    name: string;
    category: string | null;
    icon: string | null;
  };
};

export function serializarHabilidad(habilidad: {
  id: string;
  name: string;
  category: string | null;
  icon: string | null;
}) {
  return {
    id: habilidad.id,
    nombre: habilidad.name,
    categoria: habilidad.category,
    icono: habilidad.icon
  };
}

type PerfilUsuarioSerializado = {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
  userSkills?: HabilidadUsuarioConHabilidad[];
};

export function serializarPerfilUsuario(usuario: PerfilUsuarioSerializado) {
  const habilidadesUsuario = usuario.userSkills ?? [];

  return {
    id: usuario.id,
    correo: usuario.email,
    nombre: usuario.name,
    biografia: usuario.bio,
    urlAvatar: usuario.avatarUrl,
    ciudad: usuario.city,
    latitud: usuario.latitude,
    longitud: usuario.longitude,
    fechaCreacion: usuario.createdAt,
    fechaActualizacion: usuario.updatedAt,
    habilidadesOfrecidas: habilidadesUsuario
      .filter((habilidadUsuario) => habilidadUsuario.type === "OFFER")
      .map(serializarHabilidadUsuario),
    habilidadesDeseadas: habilidadesUsuario
      .filter((habilidadUsuario) => habilidadUsuario.type === "WANT")
      .map(serializarHabilidadUsuario)
  };
}

export function serializarHabilidadUsuario(habilidadUsuario: HabilidadUsuarioConHabilidad) {
  return {
    id: habilidadUsuario.id,
    tipo: mapearTipoHabilidadApi(habilidadUsuario.type),
    nivel: mapearNivelHabilidadApi(habilidadUsuario.level),
    fechaCreacion: habilidadUsuario.createdAt,
    habilidad: serializarHabilidad(habilidadUsuario.skill)
  };
}

type CoincidenciaConRelaciones = {
  id: string;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
  requesterId: string;
  receiverId: string;
  requesterOfferSkill: {
    id: string;
    name: string;
    category: string | null;
    icon: string | null;
  };
  requesterWantSkill: {
    id: string;
    name: string;
    category: string | null;
    icon: string | null;
  };
  requester: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
  };
  receiver: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
  };
  conversation?: {
    id: string;
    createdAt: Date;
  } | null;
};

export function serializarCoincidencia(coincidencia: CoincidenciaConRelaciones) {
  return {
    id: coincidencia.id,
    estado: mapearEstadoCoincidenciaApi(coincidencia.status),
    fechaCreacion: coincidencia.createdAt,
    fechaActualizacion: coincidencia.updatedAt,
    solicitanteId: coincidencia.requesterId,
    receptorId: coincidencia.receiverId,
    solicitante: {
      id: coincidencia.requester.id,
      nombre: coincidencia.requester.name,
      urlAvatar: coincidencia.requester.avatarUrl,
      ciudad: coincidencia.requester.city
    },
    receptor: {
      id: coincidencia.receiver.id,
      nombre: coincidencia.receiver.name,
      urlAvatar: coincidencia.receiver.avatarUrl,
      ciudad: coincidencia.receiver.city
    },
    habilidadOfrecidaPorSolicitante: serializarHabilidad(coincidencia.requesterOfferSkill),
    habilidadSolicitadaPorSolicitante: serializarHabilidad(coincidencia.requesterWantSkill),
    conversacion: coincidencia.conversation
      ? {
          id: coincidencia.conversation.id,
          fechaCreacion: coincidencia.conversation.createdAt
        }
      : null
  };
}

type MensajeConRemitente = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export function serializarMensaje(mensaje: MensajeConRemitente) {
  return {
    id: mensaje.id,
    conversacionId: mensaje.conversationId,
    remitenteId: mensaje.senderId,
    contenido: mensaje.content,
    leido: mensaje.isRead,
    fechaCreacion: mensaje.createdAt,
    remitente: {
      id: mensaje.sender.id,
      nombre: mensaje.sender.name,
      urlAvatar: mensaje.sender.avatarUrl
    }
  };
}

type SesionConRelaciones = {
  id: string;
  matchId: string;
  skillTaughtId: string;
  teacherId: string;
  learnerId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
  skillTaught: {
    id: string;
    name: string;
    category: string | null;
    icon: string | null;
  };
  teacher: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
  };
  learner: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
  };
  match?: {
    id: string;
    status: MatchStatus;
  };
};

export function serializarSesion(sesion: SesionConRelaciones) {
  return {
    id: sesion.id,
    coincidenciaId: sesion.matchId,
    habilidadId: sesion.skillTaughtId,
    profesorId: sesion.teacherId,
    aprendizId: sesion.learnerId,
    fechaProgramada: sesion.scheduledAt,
    duracionMinutos: sesion.durationMinutes,
    estado: mapearEstadoSesionApi(sesion.status),
    fechaCreacion: sesion.createdAt,
    fechaActualizacion: sesion.updatedAt,
    habilidad: serializarHabilidad(sesion.skillTaught),
    profesor: {
      id: sesion.teacher.id,
      nombre: sesion.teacher.name,
      urlAvatar: sesion.teacher.avatarUrl,
      ciudad: sesion.teacher.city
    },
    aprendiz: {
      id: sesion.learner.id,
      nombre: sesion.learner.name,
      urlAvatar: sesion.learner.avatarUrl,
      ciudad: sesion.learner.city
    },
    coincidencia: sesion.match
      ? {
          id: sesion.match.id,
          estado: mapearEstadoCoincidenciaApi(sesion.match.status)
        }
      : null
  };
}

type ValoracionConRelaciones = {
  id: string;
  sessionId: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  reviewer: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  reviewed: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export function serializarValoracion(valoracion: ValoracionConRelaciones) {
  return {
    id: valoracion.id,
    sesionId: valoracion.sessionId,
    valoradorId: valoracion.reviewerId,
    valoradoId: valoracion.reviewedId,
    puntuacion: valoracion.rating,
    comentario: valoracion.comment,
    fechaCreacion: valoracion.createdAt,
    autor: {
      id: valoracion.reviewer.id,
      nombre: valoracion.reviewer.name,
      urlAvatar: valoracion.reviewer.avatarUrl
    },
    valorado: {
      id: valoracion.reviewed.id,
      nombre: valoracion.reviewed.name,
      urlAvatar: valoracion.reviewed.avatarUrl
    }
  };
}

type DisponibilidadSerializada = {
  id: string;
  userId: string;
  dayOfWeek: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
};

export function serializarDisponibilidad(disponibilidad: DisponibilidadSerializada) {
  return {
    id: disponibilidad.id,
    usuarioId: disponibilidad.userId,
    diaSemana: disponibilidad.dayOfWeek,
    horaInicio: disponibilidad.startTime,
    horaFin: disponibilidad.endTime,
    fechaCreacion: disponibilidad.createdAt
  };
}
