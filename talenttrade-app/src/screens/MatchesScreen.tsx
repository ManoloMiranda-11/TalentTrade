import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, Text, View } from "react-native";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { useAuth } from "../providers/AuthProvider";
import type { MatchItem } from "../types/api";

export function MatchesScreen() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const matchesQuery = useQuery({
    queryKey: ["matches"],
    queryFn: () => apiFetch<{ coincidencias: MatchItem[] }>("/api/matches/me", { token })
  });

  const statusMutation = useMutation({
    mutationFn: ({ matchId, status }: { matchId: string; status: "ACCEPTED" | "REJECTED" }) =>
      apiFetch(`/api/matches/${matchId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      await queryClient.invalidateQueries({ queryKey: ["discover"] });
    },
    onError: (error) => {
      Alert.alert("No se pudo actualizar", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  return (
    <Screen scroll>
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: "#10253d" }}>Coincidencias</Text>
        <Text style={{ color: "#5f6f81", lineHeight: 22 }}>
          Gestiona tus solicitudes pendientes y revisa los intercambios ya aceptados.
        </Text>
      </View>

      {matchesQuery.data?.coincidencias?.map((item) => {
        const isReceiver = item.receptorId === user?.id;
        const otherPerson = item.solicitanteId === user?.id ? item.receptor : item.solicitante;

        return (
          <Card key={item.id}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#10253d" }}>{otherPerson.name}</Text>
            <Text style={{ color: "#30445a" }}>Estado: {item.estado}</Text>
            <Text style={{ color: "#30445a" }}>
              Intercambio: {item.habilidadOfrecidaPorSolicitante.name} por {item.habilidadSolicitadaPorSolicitante.name}
            </Text>
            {item.conversacion ? (
              <Text style={{ color: "#6a5a1c" }}>Conversacion activa: {item.conversacion.id.slice(0, 8)}...</Text>
            ) : null}

            {item.estado === "PENDING" && isReceiver ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={() => statusMutation.mutate({ matchId: item.id, status: "ACCEPTED" })}
                  style={{
                    flex: 1,
                    backgroundColor: "#1f6d43",
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: "center"
                  }}
                >
                  <Text style={{ color: "#f3fff7", fontWeight: "700" }}>Aceptar</Text>
                </Pressable>
                <Pressable
                  onPress={() => statusMutation.mutate({ matchId: item.id, status: "REJECTED" })}
                  style={{
                    flex: 1,
                    backgroundColor: "#9f3d3d",
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: "center"
                  }}
                >
                  <Text style={{ color: "#fff5f5", fontWeight: "700" }}>Rechazar</Text>
                </Pressable>
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}
