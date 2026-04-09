import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, Text, View } from "react-native";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { HeroCard } from "../components/HeroCard";
import { Screen } from "../components/Screen";
import { useAuth } from "../providers/AuthProvider";
import type { MatchSuggestion } from "../types/api";

export function DiscoverScreen() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const discoverQuery = useQuery({
    queryKey: ["discover"],
    queryFn: () => apiFetch<{ coincidencias: MatchSuggestion[]; message?: string }>("/api/matches/discover", { token })
  });

  const createMatchMutation = useMutation({
    mutationFn: (payload: { receiverId: string; requesterOfferSkillId: string; requesterWantSkillId: string }) =>
      apiFetch("/api/matches", {
        method: "POST",
        token,
        body: JSON.stringify(payload)
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["discover"] });
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      Alert.alert("Coincidencia enviada", "La solicitud de intercambio se ha creado correctamente.");
    },
    onError: (error) => {
      Alert.alert("No se pudo crear la coincidencia", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  return (
    <Screen scroll>
      <HeroCard
        title="Descubrir"
        subtitle="Aqui aparecen personas compatibles segun lo que ofreces y lo que quieres aprender."
      />

      {discoverQuery.isLoading ? (
        <EmptyState
          title="Buscando coincidencias"
          description="Estamos revisando perfiles compatibles para proponerte nuevos intercambios."
        />
      ) : null}
      {discoverQuery.error ? (
        <EmptyState
          title="No se pudieron cargar las coincidencias"
          description={discoverQuery.error instanceof Error ? discoverQuery.error.message : "Ha ocurrido un error inesperado."}
        />
      ) : null}

      {discoverQuery.data?.coincidencias?.map((item) => (
        <Card key={`${item.user.id}-${item.compatibility.requesterOfferSkill.id}`}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#10253d" }}>{item.user.name}</Text>
          <Text style={{ color: "#66778a" }}>{item.user.bio ?? "Perfil sin descripcion todavia."}</Text>
          <Text style={{ color: "#20364d" }}>
            Tu ofreces: <Text style={{ fontWeight: "700" }}>{item.compatibility.requesterOfferSkill.name}</Text>
          </Text>
          <Text style={{ color: "#20364d" }}>
            Tu aprendes: <Text style={{ fontWeight: "700" }}>{item.compatibility.requesterWantSkill.name}</Text>
          </Text>
          <Text style={{ color: "#20364d" }}>
            La otra persona ofrece: <Text style={{ fontWeight: "700" }}>{item.compatibility.candidateOfferSkill.name}</Text>
          </Text>

          <Pressable
            onPress={() =>
              createMatchMutation.mutate({
                receiverId: item.user.id,
                requesterOfferSkillId: item.compatibility.requesterOfferSkill.id,
                requesterWantSkillId: item.compatibility.requesterWantSkill.id
              })
            }
            style={{
              marginTop: 4,
              backgroundColor: "#0e1b2c",
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#fff4dc", fontWeight: "700" }}>
              {createMatchMutation.isPending ? "Enviando..." : "Proponer intercambio"}
            </Text>
          </Pressable>
        </Card>
      ))}

      {!discoverQuery.isLoading && !discoverQuery.data?.coincidencias?.length ? (
        <EmptyState
          title="Aun no hay coincidencias"
          description={discoverQuery.data?.message ?? "Asegurate de tener habilidades ofrecidas y deseadas para empezar a encontrar personas compatibles."}
        />
      ) : null}
    </Screen>
  );
}
