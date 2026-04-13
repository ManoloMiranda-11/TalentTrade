import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { peticionApi } from "../servicios/clienteApi";
import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { Tarjeta } from "../componentes/Tarjeta";
import { Pantalla } from "../componentes/Pantalla";
import { EstadoVacio } from "../componentes/EstadoVacio";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";
import type { Habilidad } from "../tipos/tiposApi";

const NIVELES = ["INICIAL", "MEDIO", "AVANZADO"] as const;
const TIPOS = ["OFRECER", "APRENDER"] as const;

export function PantallaHabilidades() {
  const navegacion = useNavigation();
  const { token, refrescarUsuario } = useAutenticacion();
  const clienteConsultas = useQueryClient();
  const [busqueda, setBusqueda] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState<(typeof TIPOS)[number]>("OFRECER");
  const [nivelSeleccionado, setNivelSeleccionado] = useState<(typeof NIVELES)[number]>("MEDIO");

  const consultaHabilidades = useQuery({
    queryKey: ["habilidades"],
    queryFn: () => peticionApi<{ habilidades: Habilidad[] }>("/api/habilidades", { token })
  });

  const guardarHabilidadMutation = useMutation({
    mutationFn: (habilidadId: string) =>
      peticionApi("/api/habilidades/yo", {
        method: "POST",
        token,
        body: JSON.stringify({
          habilidadId,
          tipo: tipoSeleccionado,
          nivel: nivelSeleccionado
        })
      }),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ["habilidades"] });
      await clienteConsultas.invalidateQueries({ queryKey: ["perfil"] });
      await refrescarUsuario();
      Alert.alert("Habilidad guardada", "Tu perfil ya se ha actualizado.", [
        { text: "Anadir otra", style: "cancel" },
        { text: "Ver perfil", onPress: () => navegacion.navigate("Perfil" as never) }
      ]);
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo guardar", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  const habilidadesFiltradas = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();

    return (consultaHabilidades.data?.habilidades ?? []).filter((habilidad) =>
      `${habilidad.nombre} ${habilidad.categoria ?? ""}`.toLowerCase().includes(busquedaNormalizada)
    );
  }, [busqueda, consultaHabilidades.data?.habilidades]);

  const totalHabilidades = consultaHabilidades.data?.habilidades?.length ?? 0;

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="Habilidades"
        subtitulo="Anade lo que puedes ensenar y lo que quieres aprender para que las coincidencias tengan sentido."
      >
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: "#fff4dc",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 7
          }}
        >
          <Text style={{ color: "#10253d", fontWeight: "800", fontSize: 12 }}>
            {totalHabilidades} habilidades disponibles
          </Text>
        </View>
      </CabeceraDestacada>

      <Tarjeta>
        <Text style={{ color: "#20364d", fontWeight: "700" }}>Que quieres anadir a tu perfil?</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {TIPOS.map((tipo) => (
            <Pressable
              key={tipo}
              onPress={() => setTipoSeleccionado(tipo)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: tipoSeleccionado === tipo ? "#10253d" : "#f3ecdf",
                alignItems: "center"
              }}
            >
              <Text style={{ color: tipoSeleccionado === tipo ? "#fff2d4" : "#314559", fontWeight: "700" }}>
                {tipo === "OFRECER" ? "Ofrecer" : "Aprender"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: "#20364d", fontWeight: "700" }}>Nivel</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {NIVELES.map((nivel) => (
            <Pressable
              key={nivel}
              onPress={() => setNivelSeleccionado(nivel)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: nivelSeleccionado === nivel ? "#7c2d12" : "#f7efe5",
                alignItems: "center"
              }}
            >
              <Text style={{ color: nivelSeleccionado === nivel ? "#fff2e8" : "#5a3a2e", fontWeight: "700", fontSize: 12 }}>
                {nivel === "INICIAL" ? "Inicial" : nivel === "MEDIO" ? "Medio" : "Avanzado"}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar una habilidad"
          placeholderTextColor="#9b8f7f"
          selectionColor="#7c2d12"
          style={{
            borderWidth: 1,
            borderColor: "#d9ccb3",
            borderRadius: 16,
            backgroundColor: "#fff",
            paddingHorizontal: 16,
            paddingVertical: 14,
            color: "#16283c"
          }}
        />
      </Tarjeta>

      {consultaHabilidades.isLoading ? (
        <EstadoVacio
          titulo="Cargando habilidades"
          descripcion="Estamos preparando el catalogo de habilidades disponibles."
        />
      ) : null}

      {consultaHabilidades.error ? (
        <EstadoVacio
          titulo="No se pudieron cargar"
          descripcion={consultaHabilidades.error instanceof Error ? consultaHabilidades.error.message : "Ha ocurrido un error inesperado."}
        />
      ) : null}

      {!consultaHabilidades.isLoading && !consultaHabilidades.error && habilidadesFiltradas.length === 0 ? (
        <EstadoVacio
          titulo="Sin resultados"
          descripcion="Prueba con otro nombre o categoria de habilidad."
        />
      ) : null}

      {habilidadesFiltradas.slice(0, 20).map((habilidad) => (
        <Tarjeta key={habilidad.id}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>{habilidad.nombre}</Text>
          <Text style={{ color: "#5f6f81" }}>{habilidad.categoria ?? "Sin categoria"}</Text>
          <Pressable
            onPress={() => guardarHabilidadMutation.mutate(habilidad.id)}
            disabled={guardarHabilidadMutation.isPending}
            style={{
              backgroundColor: guardarHabilidadMutation.isPending ? "#b59b8c" : "#0e1b2c",
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#fff4dc", fontWeight: "700" }}>
              {guardarHabilidadMutation.isPending ? "Guardando..." : "Anadir al perfil"}
            </Text>
          </Pressable>
        </Tarjeta>
      ))}
    </Pantalla>
  );
}
