import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { HeroCard } from "../components/HeroCard";
import { Screen } from "../components/Screen";
import { useAuth } from "../providers/AuthProvider";
import type { User } from "../types/api";

export function ProfileScreen() {
  const { token, user, signOut, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<{ user: User }>("/api/users/me", { token }),
    initialData: user ? { user } : undefined
  });

  const profile = profileQuery.data?.user;

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.name ?? "");
    setBio(profile.bio ?? "");
    setCity(profile.city ?? "");
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ user: User }>("/api/users/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name,
          bio,
          city
        })
      }),
    onSuccess: async () => {
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      Alert.alert("Perfil actualizado", "Tus datos se han guardado correctamente.");
    },
    onError: (error) => {
      Alert.alert("No se pudo actualizar", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (userSkillId: string) =>
      apiFetch(`/api/skills/me/${userSkillId}`, {
        method: "DELETE",
        token
      }),
    onSuccess: async () => {
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      Alert.alert("No se pudo eliminar la habilidad", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  return (
    <Screen scroll>
      <HeroCard
        title="Perfil"
        subtitle="Cuida tu presentacion para que la comunidad entienda mejor lo que ensenas y lo que buscas aprender."
      />

      <Card>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#10253d" }}>{profile?.name ?? "Sin nombre"}</Text>
        <Text style={{ color: "#516275" }}>{profile?.email}</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          style={{
            borderWidth: 1,
            borderColor: "#d9ccb3",
            borderRadius: 16,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 14
          }}
        />

        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="Ciudad"
          style={{
            borderWidth: 1,
            borderColor: "#d9ccb3",
            borderRadius: 16,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 14
          }}
        />

        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Cuentale a la comunidad que te gusta ensenar o aprender"
          multiline
          style={{
            borderWidth: 1,
            borderColor: "#d9ccb3",
            borderRadius: 16,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 14,
            minHeight: 110,
            textAlignVertical: "top"
          }}
        />

        <Pressable
          onPress={() => updateProfileMutation.mutate()}
          style={{
            backgroundColor: "#0e1b2c",
            paddingVertical: 14,
            borderRadius: 16,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff5df", fontWeight: "700" }}>
            {updateProfileMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Habilidades que ofreces</Text>
        {(profile?.habilidadesOfrecidas ?? []).map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12
            }}
          >
            <Text style={{ color: "#30445a", flex: 1 }}>
              - {item.skill.name} ({item.level})
            </Text>
            <Pressable onPress={() => deleteSkillMutation.mutate(item.id)}>
              <Text style={{ color: "#9f3d3d", fontWeight: "700" }}>Quitar</Text>
            </Pressable>
          </View>
        ))}
        {!profile?.habilidadesOfrecidas?.length ? <Text style={{ color: "#66778a" }}>Aun no has anadido ninguna.</Text> : null}
      </Card>

      <Card>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Habilidades que quieres aprender</Text>
        {(profile?.habilidadesDeseadas ?? []).map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12
            }}
          >
            <Text style={{ color: "#30445a", flex: 1 }}>
              - {item.skill.name} ({item.level})
            </Text>
            <Pressable onPress={() => deleteSkillMutation.mutate(item.id)}>
              <Text style={{ color: "#9f3d3d", fontWeight: "700" }}>Quitar</Text>
            </Pressable>
          </View>
        ))}
        {!profile?.habilidadesDeseadas?.length ? <Text style={{ color: "#66778a" }}>Aun no has anadido ninguna.</Text> : null}
      </Card>

      <Pressable
        onPress={signOut}
        style={{
          backgroundColor: "#8c2f39",
          paddingVertical: 16,
          borderRadius: 18,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff3f3", fontWeight: "700", fontSize: 16 }}>Cerrar sesion</Text>
      </Pressable>

      <View style={{ height: 20 }} />
    </Screen>
  );
}
