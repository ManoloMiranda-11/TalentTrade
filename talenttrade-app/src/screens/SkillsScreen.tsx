import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { useAuth } from "../providers/AuthProvider";
import type { Skill } from "../types/api";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const TYPES = ["OFFER", "WANT"] as const;

export function SkillsScreen() {
  const { token, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<(typeof TYPES)[number]>("OFFER");
  const [selectedLevel, setSelectedLevel] = useState<(typeof LEVELS)[number]>("INTERMEDIATE");

  const skillsQuery = useQuery({
    queryKey: ["skills"],
    queryFn: () => apiFetch<{ habilidades: Skill[] }>("/api/skills", { token })
  });

  const saveSkillMutation = useMutation({
    mutationFn: (skillId: string) =>
      apiFetch("/api/skills/me", {
        method: "POST",
        token,
        body: JSON.stringify({
          skillId,
          type: selectedType,
          level: selectedLevel
        })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await refreshUser();
      Alert.alert("Habilidad guardada", "Tu perfil ya se ha actualizado.");
    },
    onError: (error) => {
      Alert.alert("No se pudo guardar", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return (skillsQuery.data?.habilidades ?? []).filter((skill) =>
      `${skill.name} ${skill.category ?? ""}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query, skillsQuery.data?.habilidades]);

  return (
    <Screen scroll>
      <Text style={{ fontSize: 30, fontWeight: "800", color: "#10253d" }}>Habilidades</Text>

      <Card>
        <Text style={{ color: "#20364d", fontWeight: "700" }}>Que quieres hacer?</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: selectedType === type ? "#10253d" : "#f3ecdf",
                alignItems: "center"
              }}
            >
              <Text style={{ color: selectedType === type ? "#fff2d4" : "#314559", fontWeight: "700" }}>
                {type === "OFFER" ? "Ofrecer" : "Aprender"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: "#20364d", fontWeight: "700" }}>Nivel</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {LEVELS.map((level) => (
            <Pressable
              key={level}
              onPress={() => setSelectedLevel(level)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: selectedLevel === level ? "#7c2d12" : "#f7efe5",
                alignItems: "center"
              }}
            >
              <Text style={{ color: selectedLevel === level ? "#fff2e8" : "#5a3a2e", fontWeight: "700", fontSize: 12 }}>
                {level === "BEGINNER" ? "Inicial" : level === "INTERMEDIATE" ? "Medio" : "Avanzado"}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar habilidad"
          style={{
            borderWidth: 1,
            borderColor: "#d9ccb3",
            borderRadius: 16,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 14
          }}
        />
      </Card>

      {filteredSkills.slice(0, 20).map((skill) => (
        <Card key={skill.id}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>{skill.name}</Text>
          <Text style={{ color: "#5f6f81" }}>{skill.category ?? "Sin categoria"}</Text>
          <Pressable
            onPress={() => saveSkillMutation.mutate(skill.id)}
            style={{
              backgroundColor: "#0e1b2c",
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#fff4dc", fontWeight: "700" }}>
              {saveSkillMutation.isPending ? "Guardando..." : "Anadir al perfil"}
            </Text>
          </Pressable>
        </Card>
      ))}
    </Screen>
  );
}
