export type User = {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  habilidadesOfrecidas?: UserSkill[];
  habilidadesDeseadas?: UserSkill[];
};

export type Skill = {
  id: string;
  name: string;
  category: string | null;
  icon: string | null;
};

export type UserSkill = {
  id: string;
  type: "OFFER" | "WANT";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  createdAt?: string;
  skill: Skill;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

export type MatchSuggestion = {
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
    bio: string | null;
  };
  compatibility: {
    requesterOfferSkill: Skill;
    requesterWantSkill: Skill;
    candidateOfferSkill: Skill;
    candidateWantSkill: Skill;
  };
};

export type MatchItem = {
  id: string;
  estado: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  solicitanteId: string;
  receptorId: string;
  createdAt: string;
  updatedAt: string;
  solicitante: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
  };
  receptor: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city: string | null;
  };
  habilidadOfrecidaPorSolicitante: Skill;
  habilidadSolicitadaPorSolicitante: Skill;
  conversacion: {
    id: string;
    matchId?: string;
    createdAt: string;
  } | null;
};
