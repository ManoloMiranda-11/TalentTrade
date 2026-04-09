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
    skillsOffered: userSkills
      .filter((userSkill) => userSkill.type === "OFFER")
      .map(serializeUserSkill),
    skillsWanted: userSkills
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
