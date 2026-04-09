import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, Text, View } from "react-native";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
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
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: "#10253d" }}>Descubrir</Text>
        <Text style={{ color: "#5f6f81", lineHeight: 22 }}>
          Aqui aparecen personas compatibles segun lo que ofreces y lo que quieres aprender.
        </Text>
      </View>

      {discoverQuery.isLoading ? <Text>Cargando coincidencias...</Text> : null}
      {discoverQuery.error ? (
        <Text style={{ color: "#b23b3b" }}>{discoverQuery.error instanceof Error ? discoverQuery.error.message : "Error"}</Text>
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
        <Card>
          <Text style={{ color: "#30445a" }}>
            {discoverQuery.data?.message ?? "Todavia no hay coincidencias. Asegurate de tener habilidades ofrecidas y deseadas."}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
