import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { peticionApi } from "../servicios/clienteApi";
import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { Tarjeta } from "../componentes/Tarjeta";
import { EstadoVacio } from "../componentes/EstadoVacio";
import { Pantalla } from "../componentes/Pantalla";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";
import type { Sesion, Valoracion } from "../tipos/tiposApi";

const PUNTUACIONES = [1, 2, 3, 4, 5] as const;

function obtenerEtiquetaEstado(estado: Sesion["estado"]) {
  if (estado === "PROGRAMADA") {
    return "Programada";
  }

  if (estado === "COMPLETADA") {
    return "Completada";
  }

  return "Cancelada";
}

function obtenerColorEstado(estado: Sesion["estado"]) {
  if (estado === "COMPLETADA") {
    return "#1f6d43";
  }

  if (estado === "CANCELADA") {
    return "#9f3d3d";
  }

  return "#8b5e1a";
}

export function PantallaSesiones() {
  const navegacion = useNavigation();
  const { token, usuario } = useAutenticacion();
  const clienteConsultas = useQueryClient();
  const [puntuaciones, setPuntuaciones] = useState<Record<string, number>>({});
  const [comentarios, setComentarios] = useState<Record<string, string>>({});

  const consultaSesiones = useQuery({
    queryKey: ["sesiones"],
    queryFn: () => peticionApi<{ sesiones: Sesion[] }>("/api/sesiones/yo", { token })
  });

  const consultaValoraciones = useQuery({
    queryKey: ["valoraciones"],
    queryFn: () =>
      peticionApi<{ valoracionesRecibidas: Valoracion[]; valoracionesEscritas: Valoracion[] }>("/api/valoraciones/yo", {
        token
      })
  });

  const actualizarEstadoSesionMutation = useMutation({
    mutationFn: ({ sesionId, estado }: { sesionId: string; estado: "COMPLETADA" | "CANCELADA" }) =>
      peticionApi(`/api/sesiones/${sesionId}/estado`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ estado })
      }),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ["sesiones"] });
      await clienteConsultas.invalidateQueries({ queryKey: ["valoraciones"] });
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo actualizar la sesion", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  const crearValoracionMutation = useMutation({
    mutationFn: ({
      sesionId,
      valoradoId,
      puntuacion,
      comentario
    }: {
      sesionId: string;
      valoradoId: string;
      puntuacion: number;
      comentario: string;
    }) =>
      peticionApi("/api/valoraciones", {
        method: "POST",
        token,
        body: JSON.stringify({
          sesionId,
          valoradoId,
          puntuacion,
          comentario: comentario.trim() || null
        })
      }),
    onSuccess: async (_datos, variables) => {
      await clienteConsultas.invalidateQueries({ queryKey: ["valoraciones"] });
      setComentarios((comentariosActuales) => ({
        ...comentariosActuales,
        [variables.sesionId]: ""
      }));
      Alert.alert("Valoracion enviada", "Gracias por valorar la experiencia.");
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo crear la valoracion", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  const sesionesYaValoradas = new Set((consultaValoraciones.data?.valoracionesEscritas ?? []).map((valoracion) => valoracion.sesionId));

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="Sesiones"
        subtitulo="Aqui puedes seguir cada intercambio acordado, cerrarlo cuando termine y valorar la experiencia."
      />

      {consultaSesiones.isLoading ? (
        <EstadoVacio
          titulo="Cargando sesiones"
          descripcion="Estamos recuperando tus intercambios programados."
        />
      ) : null}

      {consultaSesiones.error ? (
        <EstadoVacio
          titulo="No se pudieron cargar las sesiones"
          descripcion={consultaSesiones.error instanceof Error ? consultaSesiones.error.message : "Ha ocurrido un error inesperado."}
        />
      ) : null}

      {!consultaSesiones.isLoading && !consultaSesiones.error && !(consultaSesiones.data?.sesiones?.length ?? 0) ? (
        <EstadoVacio
          titulo="Aun no tienes sesiones"
          descripcion="Cuando una coincidencia avance, podras organizar aqui las sesiones de aprendizaje."
        >
          <Pressable
            onPress={() => navegacion.navigate("Coincidencias" as never)}
            style={{
              marginTop: 4,
              backgroundColor: "#0e1b2c",
              paddingVertical: 14,
              borderRadius: 18,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#fff4dc", fontWeight: "800" }}>Ver coincidencias</Text>
          </Pressable>
        </EstadoVacio>
      ) : null}

      {(consultaSesiones.data?.sesiones ?? []).map((sesion) => {
        const otraPersona = sesion.profesorId === usuario?.id ? sesion.aprendiz : sesion.profesor;
        const puedeValorar = sesion.estado === "COMPLETADA" && !sesionesYaValoradas.has(sesion.id);
        const colorEstado = obtenerColorEstado(sesion.estado);
        const puntuacionSeleccionada = puntuaciones[sesion.id] ?? 5;
        const comentario = comentarios[sesion.id] ?? "";

        return (
          <Tarjeta key={sesion.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <Text style={{ flex: 1, fontSize: 22, fontWeight: "800", color: "#10253d" }}>{sesion.habilidad.nombre}</Text>
              <View
                style={{
                  backgroundColor: `${colorEstado}18`,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 7
                }}
              >
                <Text
                  style={{
                    color: colorEstado,
                    fontWeight: "800",
                    fontSize: 12
                  }}
                >
                  {obtenerEtiquetaEstado(sesion.estado)}
                </Text>
              </View>
            </View>
            <Text style={{ color: "#30445a" }}>Con: {otraPersona.nombre}</Text>
            <Text style={{ color: "#30445a" }}>
              Fecha: {new Date(sesion.fechaProgramada).toLocaleString("es-ES")}
            </Text>
            <Text style={{ color: "#30445a" }}>Duracion: {sesion.duracionMinutos} minutos</Text>

            {sesion.estado === "PROGRAMADA" ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={() => actualizarEstadoSesionMutation.mutate({ sesionId: sesion.id, estado: "COMPLETADA" })}
                  disabled={actualizarEstadoSesionMutation.isPending}
                  style={{
                    flex: 1,
                    backgroundColor: actualizarEstadoSesionMutation.isPending ? "#b59b8c" : "#1f6d43",
                    paddingVertical: 15,
                    borderRadius: 18,
                    alignItems: "center"
                  }}
                >
                  <Text style={{ color: "#f3fff7", fontWeight: "700", textAlign: "center" }}>Completar</Text>
                </Pressable>
                <Pressable
                  onPress={() => actualizarEstadoSesionMutation.mutate({ sesionId: sesion.id, estado: "CANCELADA" })}
                  disabled={actualizarEstadoSesionMutation.isPending}
                  style={{
                    flex: 1,
                    backgroundColor: actualizarEstadoSesionMutation.isPending ? "#b59b8c" : "#9f3d3d",
                    paddingVertical: 15,
                    borderRadius: 18,
                    alignItems: "center"
                  }}
                >
                  <Text style={{ color: "#fff5f5", fontWeight: "700", textAlign: "center" }}>Cancelar</Text>
                </Pressable>
              </View>
            ) : null}

            {puedeValorar ? (
              <View
                style={{
                  gap: 12,
                  backgroundColor: "#f6efe3",
                  borderRadius: 20,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#eadfc9"
                }}
              >
                <Text style={{ color: "#10253d", fontWeight: "800", fontSize: 16 }}>Valorar experiencia</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {PUNTUACIONES.map((puntuacion) => (
                    <Pressable
                      key={puntuacion}
                      onPress={() =>
                        setPuntuaciones((puntuacionesActuales) => ({
                          ...puntuacionesActuales,
                          [sesion.id]: puntuacion
                        }))
                      }
                      style={{
                        flex: 1,
                        backgroundColor: puntuacionSeleccionada === puntuacion ? "#7c2d12" : "#fffdf7",
                        borderWidth: 1,
                        borderColor: puntuacionSeleccionada === puntuacion ? "#7c2d12" : "#dfd2bb",
                        borderRadius: 14,
                        paddingVertical: 11,
                        alignItems: "center"
                      }}
                    >
                      <Text
                        style={{
                          color: puntuacionSeleccionada === puntuacion ? "#fff2e8" : "#5a3a2e",
                          fontWeight: "800"
                        }}
                      >
                        {puntuacion}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <TextInput
                  value={comentario}
                  onChangeText={(texto) =>
                    setComentarios((comentariosActuales) => ({
                      ...comentariosActuales,
                      [sesion.id]: texto
                    }))
                  }
                  placeholder="Escribe un comentario breve sobre la experiencia"
                  placeholderTextColor="#9b8f7f"
                  selectionColor="#7c2d12"
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: "#d8c9ac",
                    borderRadius: 16,
                    backgroundColor: "#fff",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    minHeight: 86,
                    textAlignVertical: "top",
                    color: "#16283c"
                  }}
                />

                <Pressable
                  onPress={() =>
                    crearValoracionMutation.mutate({
                      sesionId: sesion.id,
                      valoradoId: otraPersona.id,
                      puntuacion: puntuacionSeleccionada,
                      comentario
                    })
                  }
                  disabled={crearValoracionMutation.isPending}
                  style={{
                    backgroundColor: crearValoracionMutation.isPending ? "#b59b8c" : "#7c2d12",
                    paddingVertical: 15,
                    borderRadius: 18,
                    alignItems: "center"
                  }}
                >
                  <Text style={{ color: "#fff2e8", fontWeight: "700" }}>
                    {crearValoracionMutation.isPending ? "Enviando..." : "Enviar valoracion"}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {sesion.estado === "COMPLETADA" && sesionesYaValoradas.has(sesion.id) ? (
              <Text style={{ color: "#66778a" }}>Ya has valorado esta sesion.</Text>
            ) : null}
          </Tarjeta>
        );
      })}

      <Tarjeta>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Valoraciones recibidas</Text>
        {consultaValoraciones.isLoading ? <Text style={{ color: "#66778a" }}>Cargando valoraciones...</Text> : null}
        {consultaValoraciones.error ? (
          <Text style={{ color: "#9f3d3d" }}>
            {consultaValoraciones.error instanceof Error ? consultaValoraciones.error.message : "No se pudieron cargar."}
          </Text>
        ) : null}
        {(consultaValoraciones.data?.valoracionesRecibidas ?? []).map((valoracion) => (
          <View
            key={valoracion.id}
            style={{
              backgroundColor: "#f5efe4",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#eadfc9"
            }}
          >
            <Text style={{ color: "#30445a" }}>
              {valoracion.autor.nombre}: <Text style={{ fontWeight: "800" }}>{valoracion.puntuacion}/5</Text>
            </Text>
          </View>
        ))}
        {!consultaValoraciones.isLoading && !consultaValoraciones.error && !consultaValoraciones.data?.valoracionesRecibidas?.length ? (
          <Text style={{ color: "#66778a" }}>Todavia no has recibido valoraciones.</Text>
        ) : null}
      </Tarjeta>

      <Tarjeta>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Valoraciones enviadas</Text>
        {consultaValoraciones.isLoading ? <Text style={{ color: "#66778a" }}>Cargando valoraciones...</Text> : null}
        {consultaValoraciones.error ? (
          <Text style={{ color: "#9f3d3d" }}>
            {consultaValoraciones.error instanceof Error ? consultaValoraciones.error.message : "No se pudieron cargar."}
          </Text>
        ) : null}
        {(consultaValoraciones.data?.valoracionesEscritas ?? []).map((valoracion) => (
          <View
            key={valoracion.id}
            style={{
              backgroundColor: "#f5efe4",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#eadfc9",
              gap: 4
            }}
          >
            <Text style={{ color: "#30445a" }}>
              Para {valoracion.valorado.nombre}: <Text style={{ fontWeight: "800" }}>{valoracion.puntuacion}/5</Text>
            </Text>
            {valoracion.comentario ? <Text style={{ color: "#66778a" }}>{valoracion.comentario}</Text> : null}
          </View>
        ))}
        {!consultaValoraciones.isLoading && !consultaValoraciones.error && !consultaValoraciones.data?.valoracionesEscritas?.length ? (
          <Text style={{ color: "#66778a" }}>Todavia no has enviado valoraciones.</Text>
        ) : null}
      </Tarjeta>
    </Pantalla>
  );
}
