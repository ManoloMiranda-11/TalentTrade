import type { SkillLevel, UserSkillType } from "@prisma/client";

type UserSkillWithSkill = {
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

type UserProfilePayload = {
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
  userSkills?: UserSkillWithSkill[];
};

export function serializeUserProfile(user: UserProfilePayload) {
  const userSkills = user.userSkills ?? [];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    city: user.city,
    latitude: user.latitude,
    longitude: user.longitude,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    habilidadesOfrecidas: userSkills
      .filter((userSkill) => userSkill.type === "OFFER")
      .map(serializeUserSkill),
    habilidadesDeseadas: userSkills
      .filter((userSkill) => userSkill.type === "WANT")
      .map(serializeUserSkill)
  };
}

export function serializeUserSkill(userSkill: UserSkillWithSkill) {
  return {
    id: userSkill.id,
    type: userSkill.type,
    level: userSkill.level,
    createdAt: userSkill.createdAt,
    skill: userSkill.skill
  };
}

type MatchWithRelations = {
  id: string;
  status: string;
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

export function serializeMatch(match: MatchWithRelations) {
  return {
    id: match.id,
    estado: match.status,
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
    solicitanteId: match.requesterId,
    receptorId: match.receiverId,
    solicitante: match.requester,
    receptor: match.receiver,
    habilidadOfrecidaPorSolicitante: match.requesterOfferSkill,
    habilidadSolicitadaPorSolicitante: match.requesterWantSkill,
    conversacion: match.conversation ?? null
  };
}

type MessageWithSender = {
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

export function serializeMessage(message: MessageWithSender) {
  return {
    id: message.id,
    conversacionId: message.conversationId,
    remitenteId: message.senderId,
    contenido: message.content,
    leido: message.isRead,
    fechaCreacion: message.createdAt,
    remitente: message.sender
  };
}

type SessionWithRelations = {
  id: string;
  matchId: string;
  skillTaughtId: string;
  teacherId: string;
  learnerId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
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
    status: string;
  };
};

export function serializeSession(session: SessionWithRelations) {
  return {
    id: session.id,
    matchId: session.matchId,
    habilidadId: session.skillTaughtId,
    profesorId: session.teacherId,
    aprendizId: session.learnerId,
    fechaProgramada: session.scheduledAt,
    duracionMinutos: session.durationMinutes,
    estado: session.status,
    fechaCreacion: session.createdAt,
    fechaActualizacion: session.updatedAt,
    habilidad: session.skillTaught,
    profesor: session.teacher,
    aprendiz: session.learner,
    coincidencia: session.match ?? null
  };
}

type ReviewWithRelations = {
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

export function serializeReview(review: ReviewWithRelations) {
  return {
    id: review.id,
    sesionId: review.sessionId,
    autorId: review.reviewerId,
    valoradoId: review.reviewedId,
    puntuacion: review.rating,
    comentario: review.comment,
    fechaCreacion: review.createdAt,
    autor: review.reviewer,
    valorado: review.reviewed
  };
}

type AvailabilityPayload = {
  id: string;
  userId: string;
  dayOfWeek: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
};

export function serializeAvailability(availability: AvailabilityPayload) {
  return {
    id: availability.id,
    usuarioId: availability.userId,
    diaSemana: availability.dayOfWeek,
    horaInicio: availability.startTime,
    horaFin: availability.endTime,
    fechaCreacion: availability.createdAt
  };
}
