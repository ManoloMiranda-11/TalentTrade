import { useQuery } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";

import { apiFetch } from "../api/client";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { useAuth } from "../providers/AuthProvider";
import type { User } from "../types/api";

export function ProfileScreen() {
  const { token, user, signOut } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<{ user: User }>("/api/users/me", { token }),
    initialData: user ? { user } : undefined
  });

  const profile = profileQuery.data?.user;

  return (
    <Screen scroll>
      <Text style={{ fontSize: 30, fontWeight: "800", color: "#10253d" }}>Perfil</Text>

      <Card>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#10253d" }}>{profile?.name ?? "Sin nombre"}</Text>
        <Text style={{ color: "#516275" }}>{profile?.email}</Text>
        <Text style={{ color: "#33485d" }}>{profile?.bio ?? "Todavia no has escrito una descripcion."}</Text>
      </Card>

      <Card>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Habilidades que ofreces</Text>
        {(profile?.habilidadesOfrecidas ?? []).map((item) => (
          <Text key={item.id} style={{ color: "#30445a" }}>
            - {item.skill.name} ({item.level})
          </Text>
        ))}
        {!profile?.habilidadesOfrecidas?.length ? <Text style={{ color: "#66778a" }}>Aun no has anadido ninguna.</Text> : null}
      </Card>

      <Card>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Habilidades que quieres aprender</Text>
        {(profile?.habilidadesDeseadas ?? []).map((item) => (
          <Text key={item.id} style={{ color: "#30445a" }}>
            - {item.skill.name} ({item.level})
          </Text>
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
