import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Pressable, Text, View } from "react-native";

import { peticionApi } from "../servicios/clienteApi";
import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { Tarjeta } from "../componentes/Tarjeta";
import { EstadoVacio } from "../componentes/EstadoVacio";
import { Pantalla } from "../componentes/Pantalla";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";
import type { SugerenciaCoincidencia } from "../tipos/tiposApi";

function obtenerInicial(nombre: string) {
  return nombre.trim().charAt(0).toUpperCase() || "?";
}

export function PantallaDescubrir() {
  const navegacion = useNavigation();
  const { token } = useAutenticacion();
  const clienteConsultas = useQueryClient();

  const consultaDescubrir = useQuery({
    queryKey: ["descubrir"],
    queryFn: () =>
      peticionApi<{ coincidencias: SugerenciaCoincidencia[]; mensaje?: string }>("/api/coincidencias/descubrir", {
        token
      })
  });

  const crearCoincidenciaMutation = useMutation({
    mutationFn: (datosCoincidencia: { receptorId: string; habilidadOfrecidaId: string; habilidadDeseadaId: string }) =>
      peticionApi("/api/coincidencias", {
        method: "POST",
        token,
        body: JSON.stringify(datosCoincidencia)
      }),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ["descubrir"] });
      await clienteConsultas.invalidateQueries({ queryKey: ["coincidencias"] });
      Alert.alert("Coincidencia enviada", "La solicitud de intercambio se ha creado correctamente.", [
        { text: "Seguir mirando", style: "cancel" },
        { text: "Ver coincidencias", onPress: () => navegacion.navigate("Coincidencias" as never) }
      ]);
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo crear la coincidencia", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  const coincidencias = consultaDescubrir.data?.coincidencias ?? [];

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="Descubrir"
        subtitulo="Aquí aparecen perfiles con los que podría encajar un intercambio útil y realista."
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
            {coincidencias.length} propuestas disponibles
          </Text>
        </View>
      </CabeceraDestacada>

      {consultaDescubrir.isLoading ? (
        <EstadoVacio
          titulo="Buscando coincidencias"
          descripcion="Estamos revisando perfiles compatibles para proponerte nuevos intercambios."
        />
      ) : null}
      {consultaDescubrir.error ? (
        <EstadoVacio
          titulo="No se pudieron cargar las coincidencias"
          descripcion={consultaDescubrir.error instanceof Error ? consultaDescubrir.error.message : "Ha ocurrido un error inesperado."}
        />
      ) : null}

      {coincidencias.map((sugerencia) => (
        <Tarjeta key={`${sugerencia.usuario.id}-${sugerencia.compatibilidad.habilidadOfrecidaPorSolicitante.id}`}>
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 20,
                backgroundColor: "#10253d",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: "#ffcf70", fontSize: 22, fontWeight: "900" }}>{obtenerInicial(sugerencia.usuario.nombre)}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#10253d" }}>{sugerencia.usuario.nombre}</Text>
              <Text style={{ color: "#66778a" }}>{sugerencia.usuario.ciudad ?? "Ciudad no indicada"}</Text>
            </View>
          </View>

          <Text style={{ color: "#66778a", lineHeight: 21 }}>
            {sugerencia.usuario.biografia ?? "Perfil sin descripción todavía."}
          </Text>

          <View
            style={{
              gap: 10,
              backgroundColor: "#f4eee2",
              borderRadius: 20,
              padding: 14,
              borderWidth: 1,
              borderColor: "#eadfc9"
            }}
          >
            <Text style={{ color: "#7b5d1d", fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>
              ENCAJE DETECTADO
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: "#7b5d1d", fontSize: 12, fontWeight: "800" }}>Tú enseñas</Text>
                <Text style={{ color: "#20364d", fontWeight: "800" }}>
                  {sugerencia.compatibilidad.habilidadOfrecidaPorSolicitante.nombre}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: "#7b5d1d", fontSize: 12, fontWeight: "800" }}>Tú aprendes</Text>
                <Text style={{ color: "#20364d", fontWeight: "800" }}>
                  {sugerencia.compatibilidad.habilidadDeseadaPorSolicitante.nombre}
                </Text>
              </View>
            </View>
            <Text style={{ color: "#20364d", lineHeight: 20 }}>
              La otra persona puede ayudarte con{" "}
              <Text style={{ fontWeight: "800" }}>{sugerencia.compatibilidad.habilidadOfrecidaPorCandidato.nombre}</Text>.
            </Text>
          </View>

          <Pressable
            onPress={() =>
              crearCoincidenciaMutation.mutate({
                receptorId: sugerencia.usuario.id,
                habilidadOfrecidaId: sugerencia.compatibilidad.habilidadOfrecidaPorSolicitante.id,
                habilidadDeseadaId: sugerencia.compatibilidad.habilidadDeseadaPorSolicitante.id
              })
            }
            disabled={crearCoincidenciaMutation.isPending}
            style={{
              marginTop: 2,
              backgroundColor: crearCoincidenciaMutation.isPending ? "#b59b8c" : "#0f2034",
              paddingVertical: 15,
              borderRadius: 18,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#fff4dc", fontWeight: "700" }}>
              {crearCoincidenciaMutation.isPending ? "Enviando..." : "Proponer intercambio"}
            </Text>
          </Pressable>
        </Tarjeta>
      ))}

      {!consultaDescubrir.isLoading && !consultaDescubrir.error && !consultaDescubrir.data?.coincidencias?.length ? (
        <EstadoVacio
          titulo="Aún no hay coincidencias"
          descripcion={consultaDescubrir.data?.mensaje ?? "Asegúrate de tener habilidades ofrecidas y deseadas para empezar a encontrar personas compatibles."}
        >
          <Pressable
            onPress={() => navegacion.navigate("Habilidades" as never)}
            style={{
              marginTop: 4,
              backgroundColor: "#0e1b2c",
              paddingVertical: 14,
              borderRadius: 18,
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#fff4dc", fontWeight: "800" }}>Revisar mis habilidades</Text>
          </Pressable>
        </EstadoVacio>
      ) : null}
    </Pantalla>
  );
}
