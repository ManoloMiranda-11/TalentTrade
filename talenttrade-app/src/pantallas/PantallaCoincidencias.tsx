import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { peticionApi } from "../servicios/clienteApi";
import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { SelectorTemporal } from "../componentes/SelectorTemporal";
import { Tarjeta } from "../componentes/Tarjeta";
import { EstadoVacio } from "../componentes/EstadoVacio";
import { Pantalla } from "../componentes/Pantalla";
import type { ParametrosNavegacionPrincipal } from "../navegacion/tiposNavegacion";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";
import { useAviso } from "../proveedores/ProveedorAvisos";
import type { Coincidencia } from "../tipos/tiposApi";

function obtenerFechaManana() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  fecha.setHours(18, 0, 0, 0);
  return fecha;
}

function obtenerEtiquetaEstadoCoincidencia(estado: Coincidencia["estado"]) {
  if (estado === "PENDIENTE") {
    return "Pendiente";
  }

  if (estado === "ACEPTADA") {
    return "Aceptada";
  }

  if (estado === "RECHAZADA") {
    return "Rechazada";
  }

  return "Cancelada";
}

function obtenerColorEstadoCoincidencia(estado: Coincidencia["estado"]) {
  if (estado === "ACEPTADA") {
    return "#1f6d43";
  }

  if (estado === "PENDIENTE") {
    return "#8b5e1a";
  }

  return "#9f3d3d";
}

export function PantallaCoincidencias() {
  const navegacion = useNavigation<NavigationProp<ParametrosNavegacionPrincipal>>();
  const { token, usuario } = useAutenticacion();
  const aviso = useAviso();
  const clienteConsultas = useQueryClient();
  const [fechaProgramada, setFechaProgramada] = useState<Date>(() => obtenerFechaManana());
  const [duracionMinutos, setDuracionMinutos] = useState("60");

  const consultaCoincidencias = useQuery({
    queryKey: ["coincidencias"],
    queryFn: () => peticionApi<{ coincidencias: Coincidencia[] }>("/api/coincidencias/yo", { token })
  });

  const coincidencias = consultaCoincidencias.data?.coincidencias ?? [];
  const totalAceptadas = coincidencias.filter((coincidencia) => coincidencia.estado === "ACEPTADA").length;

  const actualizarEstadoMutation = useMutation({
    mutationFn: ({ coincidenciaId, estado }: { coincidenciaId: string; estado: "ACEPTADA" | "RECHAZADA" }) =>
      peticionApi(`/api/coincidencias/${coincidenciaId}/estado`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ estado })
      }),
    onSuccess: async (_resultado, variables) => {
      await clienteConsultas.invalidateQueries({ queryKey: ["coincidencias"] });
      await clienteConsultas.invalidateQueries({ queryKey: ["descubrir"] });
      if (variables.estado === "ACEPTADA") {
        aviso.exito("Coincidencia aceptada", "Ya podéis hablar por el chat para concretar la sesión.");
      } else {
        aviso.info("Coincidencia rechazada", "Hemos avisado al otro usuario.");
      }
    },
    onError: (errorCapturado) => {
      aviso.error(
        "No se pudo actualizar",
        errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado."
      );
    }
  });

  const crearSesionMutation = useMutation({
    mutationFn: (datosSesion: { coincidenciaId: string; habilidadId: string; profesorId: string; aprendizId: string }) => {
      const duracion = Number(duracionMinutos);

      if (!Number.isInteger(duracion) || duracion < 15 || duracion > 480) {
        throw new Error("La duración debe estar entre 15 y 480 minutos.");
      }

      if (fechaProgramada.getTime() <= Date.now()) {
        throw new Error("La fecha programada debe ser futura.");
      }

      return peticionApi("/api/sesiones", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...datosSesion,
          fechaProgramada: fechaProgramada.toISOString(),
          duracionMinutos: duracion
        })
      });
    },
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ["sesiones"] });
      aviso.exito("Sesión creada", "La sesión ya aparece en la pantalla de sesiones.", {
        etiqueta: "Ver sesiones",
        alPulsar: () => navegacion.navigate("Sesiones" as never)
      });
    },
    onError: (errorCapturado) => {
      aviso.error(
        "No se pudo crear la sesión",
        errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado."
      );
    }
  });

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="Coincidencias"
        subtitulo="Gestiona tus solicitudes pendientes y revisa los intercambios ya aceptados."
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <View
            style={{
              backgroundColor: "#fff4dc",
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 7
            }}
          >
            <Text style={{ color: "#10253d", fontWeight: "800", fontSize: 12 }}>{coincidencias.length} en total</Text>
          </View>
          <View
            style={{
              backgroundColor: "#d7f0df",
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 7
            }}
          >
            <Text style={{ color: "#1f6d43", fontWeight: "800", fontSize: 12 }}>{totalAceptadas} aceptadas</Text>
          </View>
        </View>
      </CabeceraDestacada>

      {!consultaCoincidencias.isLoading && !consultaCoincidencias.error && !consultaCoincidencias.data?.coincidencias?.length ? (
        <EstadoVacio
          titulo="Todavía no tienes coincidencias"
          descripcion="Cuando envíes o aceptes un intercambio, aparecerá aquí para que puedas gestionarlo."
        >
          <Pressable
            onPress={() => navegacion.navigate("Descubrir" as never)}
            style={{
              marginTop: 4,
              backgroundColor: "#0e1b2c",
              paddingVertical: 14,
              borderRadius: 18,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#fff4dc", fontWeight: "800" }}>Buscar propuestas</Text>
          </Pressable>
        </EstadoVacio>
      ) : null}

      {consultaCoincidencias.isLoading ? (
        <EstadoVacio
          titulo="Cargando coincidencias"
          descripcion="Estamos revisando tus solicitudes e intercambios activos."
        />
      ) : null}

      {consultaCoincidencias.error ? (
        <EstadoVacio
          titulo="No se pudieron cargar"
          descripcion={consultaCoincidencias.error instanceof Error ? consultaCoincidencias.error.message : "Ha ocurrido un error inesperado."}
        />
      ) : null}

      {coincidencias.map((coincidencia) => {
        const esReceptor = coincidencia.receptorId === usuario?.id;
        const otraPersona = coincidencia.solicitanteId === usuario?.id ? coincidencia.receptor : coincidencia.solicitante;
        const idConversacion = coincidencia.conversacion?.id;
        const esSolicitante = coincidencia.solicitanteId === usuario?.id;
        const opcionesSesion = usuario
          ? [
              {
                etiqueta: `Yo enseño ${esSolicitante ? coincidencia.habilidadOfrecidaPorSolicitante.nombre : coincidencia.habilidadSolicitadaPorSolicitante.nombre}`,
                datos: {
                  coincidenciaId: coincidencia.id,
                  habilidadId: esSolicitante
                    ? coincidencia.habilidadOfrecidaPorSolicitante.id
                    : coincidencia.habilidadSolicitadaPorSolicitante.id,
                  profesorId: usuario.id,
                  aprendizId: otraPersona.id
                }
              },
              {
                etiqueta: `Aprender ${esSolicitante ? coincidencia.habilidadSolicitadaPorSolicitante.nombre : coincidencia.habilidadOfrecidaPorSolicitante.nombre}`,
                datos: {
                  coincidenciaId: coincidencia.id,
                  habilidadId: esSolicitante
                    ? coincidencia.habilidadSolicitadaPorSolicitante.id
                    : coincidencia.habilidadOfrecidaPorSolicitante.id,
                  profesorId: otraPersona.id,
                  aprendizId: usuario.id
                }
              }
            ]
          : [];
        const colorEstado = obtenerColorEstadoCoincidencia(coincidencia.estado);

        return (
          <Tarjeta key={coincidencia.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <Text style={{ flex: 1, fontSize: 22, fontWeight: "800", color: "#10253d" }}>{otraPersona.nombre}</Text>
              <View
                style={{
                  backgroundColor: `${colorEstado}18`,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 7
                }}
              >
                <Text style={{ color: colorEstado, fontWeight: "800", fontSize: 12 }}>
                  {obtenerEtiquetaEstadoCoincidencia(coincidencia.estado)}
                </Text>
              </View>
            </View>
            <Text style={{ color: "#30445a" }}>
              Intercambio: {coincidencia.habilidadOfrecidaPorSolicitante.nombre} por {coincidencia.habilidadSolicitadaPorSolicitante.nombre}
            </Text>
            {coincidencia.conversacion ? (
              <View
                style={{
                  backgroundColor: "#fff7df",
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  borderWidth: 1,
                  borderColor: "#eadfc9"
                }}
              >
                <Text style={{ color: "#6a5a1c", fontWeight: "700" }}>Chat preparado para organizar detalles.</Text>
              </View>
            ) : null}

            {coincidencia.estado === "ACEPTADA" && idConversacion ? (
              <Pressable
                onPress={() =>
                  navegacion.navigate("Conversacion", {
                    conversacionId: idConversacion,
                    titulo: otraPersona.nombre
                  })
                }
                style={{
                  backgroundColor: "#7c2d12",
                  paddingVertical: 15,
                  borderRadius: 18,
                  alignItems: "center"
                }}
              >
                <Text style={{ color: "#fff4e8", fontWeight: "700" }}>Abrir chat</Text>
              </Pressable>
            ) : null}

            {coincidencia.estado === "ACEPTADA" ? (
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
                <View style={{ gap: 4 }}>
                  <Text style={{ color: "#10253d", fontWeight: "800", fontSize: 16 }}>Programar sesión</Text>
                  <Text style={{ color: "#66778a", lineHeight: 20 }}>
                    Elige fecha, hora y quién enseña para crear una sesión con esta coincidencia.
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ color: "#7b5d1d", fontWeight: "800", fontSize: 12 }}>Fecha</Text>
                    <SelectorTemporal
                      modo="date"
                      valor={fechaProgramada}
                      alCambiar={setFechaProgramada}
                      fechaMinima={new Date()}
                    />
                  </View>
                  <View style={{ width: 130, gap: 6 }}>
                    <Text style={{ color: "#7b5d1d", fontWeight: "800", fontSize: 12 }}>Hora</Text>
                    <SelectorTemporal modo="time" valor={fechaProgramada} alCambiar={setFechaProgramada} />
                  </View>
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ color: "#7b5d1d", fontWeight: "800", fontSize: 12 }}>Duración en minutos</Text>
                  <TextInput
                    value={duracionMinutos}
                    onChangeText={setDuracionMinutos}
                    placeholder="60"
                    keyboardType="numeric"
                    placeholderTextColor="#9b8f7f"
                    selectionColor="#7c2d12"
                    style={{
                      borderWidth: 1,
                      borderColor: "#d8c9ac",
                      borderRadius: 16,
                      backgroundColor: "#fff",
                      paddingHorizontal: 14,
                      paddingVertical: 12
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  {opcionesSesion.map((opcionSesion) => (
                    <Pressable
                      key={opcionSesion.etiqueta}
                      onPress={() => crearSesionMutation.mutate(opcionSesion.datos)}
                      disabled={crearSesionMutation.isPending}
                      style={{
                        flex: 1,
                        backgroundColor: crearSesionMutation.isPending ? "#b59b8c" : "#0e1b2c",
                        paddingVertical: 14,
                        borderRadius: 16,
                        alignItems: "center"
                      }}
                    >
                      <Text style={{ color: "#fff5df", fontWeight: "700", textAlign: "center" }}>
                        {crearSesionMutation.isPending ? "Creando..." : opcionSesion.etiqueta}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {coincidencia.estado === "PENDIENTE" && esReceptor ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={() => actualizarEstadoMutation.mutate({ coincidenciaId: coincidencia.id, estado: "ACEPTADA" })}
                  disabled={actualizarEstadoMutation.isPending}
                  style={{
                    flex: 1,
                    backgroundColor: actualizarEstadoMutation.isPending ? "#b59b8c" : "#1f6d43",
                    paddingVertical: 15,
                    borderRadius: 18,
                    alignItems: "center"
                  }}
                >
                  <Text style={{ color: "#f3fff7", fontWeight: "700" }}>Aceptar</Text>
                </Pressable>
                <Pressable
                  onPress={() => actualizarEstadoMutation.mutate({ coincidenciaId: coincidencia.id, estado: "RECHAZADA" })}
                  disabled={actualizarEstadoMutation.isPending}
                  style={{
                    flex: 1,
                    backgroundColor: actualizarEstadoMutation.isPending ? "#b59b8c" : "#9f3d3d",
                    paddingVertical: 15,
                    borderRadius: 18,
                    alignItems: "center"
                  }}
                >
                  <Text style={{ color: "#fff5f5", fontWeight: "700" }}>Rechazar</Text>
                </Pressable>
              </View>
            ) : null}
          </Tarjeta>
        );
      })}
    </Pantalla>
  );
}
