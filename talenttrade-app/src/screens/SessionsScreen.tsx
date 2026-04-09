import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, Text, View } from "react-native";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { HeroCard } from "../components/HeroCard";
import { Screen } from "../components/Screen";
import { useAuth } from "../providers/AuthProvider";
import type { ReviewItem, SessionItem } from "../types/api";

export function SessionsScreen() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiFetch<{ sesiones: SessionItem[] }>("/api/sessions/me", { token })
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      apiFetch<{ valoracionesRecibidas: ReviewItem[]; valoracionesEscritas: ReviewItem[] }>("/api/reviews/me", {
        token
      })
  });

  const completeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiFetch(`/api/sessions/${sessionId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status: "COMPLETED" })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => {
      Alert.alert("No se pudo actualizar la sesion", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  const reviewMutation = useMutation({
    mutationFn: ({ sessionId, reviewedId }: { sessionId: string; reviewedId: string }) =>
      apiFetch("/api/reviews", {
        method: "POST",
        token,
        body: JSON.stringify({
          sessionId,
          reviewedId,
          rating: 5,
          comment: "Muy buena experiencia de aprendizaje."
        })
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => {
      Alert.alert("No se pudo crear la valoracion", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  const writtenReviewSessionIds = new Set((reviewsQuery.data?.valoracionesEscritas ?? []).map((review) => review.sesionId));

  return (
    <Screen scroll>
      <HeroCard
        title="Sesiones"
        subtitle="Aqui puedes seguir tus intercambios programados, marcarlos como completados y valorar la experiencia."
      />

      {!(sessionsQuery.data?.sesiones?.length ?? 0) ? (
        <EmptyState
          title="Aun no tienes sesiones"
          description="Cuando una coincidencia avance, podras organizar aqui las sesiones de aprendizaje."
        />
      ) : null}

      {(sessionsQuery.data?.sesiones ?? []).map((session) => {
        const otherPerson = session.profesorId === user?.id ? session.aprendiz : session.profesor;
        const canReview = session.estado === "COMPLETED" && !writtenReviewSessionIds.has(session.id);

        return (
          <Card key={session.id}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#10253d" }}>{session.habilidad.name}</Text>
            <Text style={{ color: "#30445a" }}>Con: {otherPerson.name}</Text>
            <Text style={{ color: "#30445a" }}>Estado: {session.estado}</Text>
            <Text style={{ color: "#30445a" }}>
              Fecha: {new Date(session.fechaProgramada).toLocaleString("es-ES")}
            </Text>
            <Text style={{ color: "#30445a" }}>Duracion: {session.duracionMinutos} minutos</Text>

            {session.estado === "SCHEDULED" ? (
              <Pressable
                onPress={() => completeSessionMutation.mutate(session.id)}
                style={{
                  backgroundColor: "#1f6d43",
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center"
                }}
              >
                <Text style={{ color: "#f3fff7", fontWeight: "700" }}>Marcar como completada</Text>
              </Pressable>
            ) : null}

            {canReview ? (
              <Pressable
                onPress={() =>
                  reviewMutation.mutate({
                    sessionId: session.id,
                    reviewedId: otherPerson.id
                  })
                }
                style={{
                  backgroundColor: "#7c2d12",
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center"
                }}
              >
                <Text style={{ color: "#fff2e8", fontWeight: "700" }}>Valorar experiencia</Text>
              </Pressable>
            ) : null}
          </Card>
        );
      })}

      <Card>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Valoraciones recibidas</Text>
        {(reviewsQuery.data?.valoracionesRecibidas ?? []).map((review) => (
          <Text key={review.id} style={{ color: "#30445a" }}>
            - {review.autor.name}: {review.puntuacion}/5
          </Text>
        ))}
        {!reviewsQuery.data?.valoracionesRecibidas?.length ? (
          <Text style={{ color: "#66778a" }}>Todavia no has recibido valoraciones.</Text>
        ) : null}
      </Card>
    </Screen>
  );
}
