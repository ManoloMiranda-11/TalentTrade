import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { apiFetch } from "../api/client";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { useAuth } from "../providers/AuthProvider";
import type { MessageItem } from "../types/api";

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, "Chat">;

export function ChatScreen({ route }: ChatScreenProps) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const { conversationId, title } = route.params;

  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => apiFetch<{ mensajes: MessageItem[] }>(`/api/messages/${conversationId}`, { token }),
    refetchInterval: 4000
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      apiFetch(`/api/messages/${conversationId}`, {
        method: "POST",
        token,
        body: JSON.stringify({ content: message })
      }),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    }
  });

  const messages = useMemo(() => messagesQuery.data?.mensajes ?? [], [messagesQuery.data?.mensajes]);

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#10253d" }}>{title}</Text>
        <Text style={{ color: "#5f6f81" }}>Conversacion activa</Text>
      </View>

      <View style={{ flex: 1, gap: 12 }}>
        {messages.map((message) => {
          const isOwn = message.remitenteId === user?.id;

          return (
            <View
              key={message.id}
              style={{
                alignSelf: isOwn ? "flex-end" : "flex-start",
                backgroundColor: isOwn ? "#0e1b2c" : "#fffdf7",
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
                maxWidth: "84%",
                borderWidth: isOwn ? 0 : 1,
                borderColor: "#eadfca"
              }}
            >
              <Text style={{ color: isOwn ? "#fff5df" : "#17283d", fontWeight: "700", marginBottom: 4 }}>
                {message.remitente.name}
              </Text>
              <Text style={{ color: isOwn ? "#fff8ec" : "#33485d", lineHeight: 20 }}>{message.contenido}</Text>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Escribe un mensaje"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#d9ccb3",
            borderRadius: 16,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 14
          }}
        />
        <Pressable
          onPress={() => {
            const trimmed = content.trim();
            if (!trimmed) {
              return;
            }

            sendMessageMutation.mutate(trimmed);
          }}
          style={{
            backgroundColor: "#7c2d12",
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderRadius: 16
          }}
        >
          <Text style={{ color: "#fff2e8", fontWeight: "700" }}>
            {sendMessageMutation.isPending ? "..." : "Enviar"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
