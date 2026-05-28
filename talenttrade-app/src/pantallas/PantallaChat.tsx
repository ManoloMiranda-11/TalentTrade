import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { peticionApi } from "../servicios/clienteApi";
import { Pantalla } from "../componentes/Pantalla";
import { EstadoVacio } from "../componentes/EstadoVacio";
import type { ParametrosNavegacionPrincipal } from "../navegacion/tiposNavegacion";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";
import type { Mensaje } from "../tipos/tiposApi";

type PropiedadesPantallaChat = NativeStackScreenProps<ParametrosNavegacionPrincipal, "Conversacion">;

export function PantallaChat({ route: ruta }: PropiedadesPantallaChat) {
  const { token, usuario } = useAutenticacion();
  const clienteConsultas = useQueryClient();
  const [mensaje, setMensaje] = useState("");
  const { conversacionId, titulo } = ruta.params;

  const consultaMensajes = useQuery({
    queryKey: ["mensajes", conversacionId],
    queryFn: () => peticionApi<{ mensajes: Mensaje[] }>(`/api/mensajes/${conversacionId}`, { token }),
    refetchInterval: 4000
  });

  const enviarMensajeMutation = useMutation({
    mutationFn: (contenido: string) =>
      peticionApi(`/api/mensajes/${conversacionId}`, {
        method: "POST",
        token,
        body: JSON.stringify({ contenido })
      }),
    onSuccess: async () => {
      setMensaje("");
      await clienteConsultas.invalidateQueries({ queryKey: ["mensajes", conversacionId] });
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo enviar", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  const mensajes = useMemo(() => consultaMensajes.data?.mensajes ?? [], [consultaMensajes.data?.mensajes]);

  return (
    <Pantalla>
      <View
        style={{
          gap: 6,
          backgroundColor: "#f7f0e3",
          borderRadius: 24,
          paddingHorizontal: 18,
          paddingVertical: 16,
          borderWidth: 1,
          borderColor: "#e5d8bf"
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#10253d" }}>{titulo}</Text>
        <Text style={{ color: "#5f6f81" }}>Canal abierto para este intercambio</Text>
      </View>

      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#fcfaf4",
          borderRadius: 24,
          padding: 14,
          borderWidth: 1,
          borderColor: "#eadfca"
        }}
        contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {consultaMensajes.isLoading ? (
          <EstadoVacio
            titulo="Cargando mensajes"
            descripcion="Estamos abriendo la conversación."
          />
        ) : null}

        {consultaMensajes.error ? (
          <EstadoVacio
            titulo="No se pudieron cargar"
            descripcion={consultaMensajes.error instanceof Error ? consultaMensajes.error.message : "Ha ocurrido un error inesperado."}
          />
        ) : null}

        {!consultaMensajes.isLoading && !consultaMensajes.error && mensajes.length === 0 ? (
          <EstadoVacio
            titulo="Todavía no hay mensajes"
            descripcion="Escribe el primer mensaje para empezar a organizar el intercambio."
          />
        ) : null}

        {mensajes.map((mensajeItem) => {
          const esPropio = mensajeItem.remitenteId === usuario?.id;

          return (
            <View
              key={mensajeItem.id}
              style={{
                alignSelf: esPropio ? "flex-end" : "flex-start",
                backgroundColor: esPropio ? "#0e1b2c" : "#fffdf7",
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
                maxWidth: "84%",
                borderWidth: esPropio ? 0 : 1,
                borderColor: "#eadfca"
              }}
            >
              <Text style={{ color: esPropio ? "#fff5df" : "#17283d", fontWeight: "700", marginBottom: 4 }}>
                {mensajeItem.remitente.nombre}
              </Text>
              <Text style={{ color: esPropio ? "#fff8ec" : "#33485d", lineHeight: 20 }}>{mensajeItem.contenido}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <TextInput
          value={mensaje}
          onChangeText={setMensaje}
          placeholder="Escribe tu mensaje"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#d8c9ac",
            borderRadius: 18,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 14
          }}
        />
        <Pressable
          onPress={() => {
            const mensajeLimpio = mensaje.trim();
            if (!mensajeLimpio) {
              return;
            }

            enviarMensajeMutation.mutate(mensajeLimpio);
          }}
          disabled={enviarMensajeMutation.isPending || mensaje.trim().length === 0}
          style={{
            backgroundColor: enviarMensajeMutation.isPending || mensaje.trim().length === 0 ? "#b59b8c" : "#7c2d12",
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderRadius: 18
          }}
        >
          <Text style={{ color: "#fff2e8", fontWeight: "700" }}>
            {enviarMensajeMutation.isPending ? "..." : "Enviar"}
          </Text>
        </Pressable>
      </View>
    </Pantalla>
  );
}
