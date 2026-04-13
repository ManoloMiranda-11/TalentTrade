import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { peticionApi } from "../servicios/clienteApi";
import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { Tarjeta } from "../componentes/Tarjeta";
import { EstadoVacio } from "../componentes/EstadoVacio";
import { Pantalla } from "../componentes/Pantalla";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";
import type { DiaSemana, Disponibilidad, HabilidadUsuario, Usuario } from "../tipos/tiposApi";

const DIAS_SEMANA: { valor: DiaSemana; etiqueta: string }[] = [
  { valor: "MON", etiqueta: "Lunes" },
  { valor: "TUE", etiqueta: "Martes" },
  { valor: "WED", etiqueta: "Miercoles" },
  { valor: "THU", etiqueta: "Jueves" },
  { valor: "FRI", etiqueta: "Viernes" },
  { valor: "SAT", etiqueta: "Sabado" },
  { valor: "SUN", etiqueta: "Domingo" }
];

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/u;

function formatearHoraDisponibilidad(valor: string) {
  if (valor.includes("T")) {
    return valor.split("T")[1]?.slice(0, 5) ?? valor;
  }

  return valor.slice(0, 5);
}

function obtenerEtiquetaDia(diaSemana: DiaSemana) {
  return DIAS_SEMANA.find((dia) => dia.valor === diaSemana)?.etiqueta ?? diaSemana;
}

function formatearNivel(nivel: HabilidadUsuario["nivel"]) {
  if (nivel === "INICIAL") {
    return "Inicial";
  }

  if (nivel === "MEDIO") {
    return "Medio";
  }

  return "Avanzado";
}

function obtenerInicial(nombre?: string | null) {
  return nombre?.trim().charAt(0).toUpperCase() || "?";
}

function convertirHoraAMinutos(valor: string) {
  const [horas, minutos] = valor.split(":").map(Number);
  return horas * 60 + minutos;
}

function validarRangoDisponibilidad(horaInicio: string, horaFin: string) {
  const inicio = horaInicio.trim();
  const fin = horaFin.trim();

  if (!FORMATO_HORA.test(inicio) || !FORMATO_HORA.test(fin)) {
    throw new Error("Usa horas con formato HH:mm, por ejemplo 18:00.");
  }

  if (convertirHoraAMinutos(inicio) >= convertirHoraAMinutos(fin)) {
    throw new Error("La hora de inicio debe ser anterior a la hora de fin.");
  }

  return { horaInicio: inicio, horaFin: fin };
}

export function PantallaPerfil() {
  const { token, usuario, cerrarSesion, refrescarUsuario } = useAutenticacion();
  const clienteConsultas = useQueryClient();
  const [nombre, setNombre] = useState("");
  const [biografia, setBiografia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [diaSemana, setDiaSemana] = useState<DiaSemana>("MON");
  const [horaInicio, setHoraInicio] = useState("18:00");
  const [horaFin, setHoraFin] = useState("20:00");

  const consultaPerfil = useQuery({
    queryKey: ["perfil"],
    queryFn: () => peticionApi<{ usuario: Usuario }>("/api/usuarios/yo", { token }),
    initialData: usuario ? { usuario } : undefined
  });

  const consultaDisponibilidad = useQuery({
    queryKey: ["disponibilidad"],
    queryFn: () => peticionApi<{ disponibilidades: Disponibilidad[] }>("/api/disponibilidad/yo", { token })
  });

  const perfil = consultaPerfil.data?.usuario;
  const disponibilidades = consultaDisponibilidad.data?.disponibilidades ?? [];
  const habilidadesOfrecidas = perfil?.habilidadesOfrecidas ?? [];
  const habilidadesDeseadas = perfil?.habilidadesDeseadas ?? [];

  useEffect(() => {
    if (!perfil) {
      return;
    }

    setNombre(perfil.nombre ?? "");
    setBiografia(perfil.biografia ?? "");
    setCiudad(perfil.ciudad ?? "");
  }, [perfil]);

  const actualizarPerfilMutation = useMutation({
    mutationFn: () =>
      peticionApi<{ usuario: Usuario }>("/api/usuarios/yo", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          nombre,
          biografia,
          ciudad
        })
      }),
    onSuccess: async () => {
      await refrescarUsuario();
      await clienteConsultas.invalidateQueries({ queryKey: ["perfil"] });
      Alert.alert("Perfil actualizado", "Tus datos se han guardado correctamente.");
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo actualizar", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  const eliminarHabilidadMutation = useMutation({
    mutationFn: (habilidadUsuarioId: string) =>
      peticionApi(`/api/habilidades/yo/${habilidadUsuarioId}`, {
        method: "DELETE",
        token
      }),
    onSuccess: async () => {
      await refrescarUsuario();
      await clienteConsultas.invalidateQueries({ queryKey: ["perfil"] });
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo eliminar la habilidad", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  const crearDisponibilidadMutation = useMutation({
    mutationFn: () => {
      const rango = validarRangoDisponibilidad(horaInicio, horaFin);

      return peticionApi<{ disponibilidad: Disponibilidad }>("/api/disponibilidad/yo", {
        method: "POST",
        token,
        body: JSON.stringify({
          diaSemana,
          ...rango
        })
      });
    },
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ["disponibilidad"] });
      Alert.alert("Disponibilidad guardada", "Ese hueco ya aparece en tu perfil.");
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo guardar", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  const eliminarDisponibilidadMutation = useMutation({
    mutationFn: (disponibilidadId: string) =>
      peticionApi(`/api/disponibilidad/yo/${disponibilidadId}`, {
        method: "DELETE",
        token
      }),
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ["disponibilidad"] });
    },
    onError: (errorCapturado) => {
      Alert.alert("No se pudo eliminar", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="Perfil"
        subtitulo="Cuida tu presentacion para que otras personas entiendan rapido lo que ensenas y lo que quieres aprender."
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
            <Text style={{ color: "#10253d", fontWeight: "800", fontSize: 12 }}>{habilidadesOfrecidas.length} ofreces</Text>
          </View>
          <View
            style={{
              backgroundColor: "#d7e2e0",
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 7
            }}
          >
            <Text style={{ color: "#10253d", fontWeight: "800", fontSize: 12 }}>{habilidadesDeseadas.length} aprendes</Text>
          </View>
          <View
            style={{
              backgroundColor: "#f3d8ca",
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 7
            }}
          >
            <Text style={{ color: "#7c2d12", fontWeight: "800", fontSize: 12 }}>{disponibilidades.length} huecos</Text>
          </View>
        </View>
      </CabeceraDestacada>

      {consultaPerfil.isLoading ? (
        <EstadoVacio
          titulo="Cargando perfil"
          descripcion="Estamos recuperando tus datos personales y tus habilidades."
        />
      ) : null}

      {consultaPerfil.error ? (
        <EstadoVacio
          titulo="No se pudo cargar el perfil"
          descripcion={consultaPerfil.error instanceof Error ? consultaPerfil.error.message : "Ha ocurrido un error inesperado."}
        />
      ) : null}

      <Tarjeta>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 22,
              backgroundColor: "#10253d",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ color: "#ffcf70", fontSize: 23, fontWeight: "900" }}>{obtenerInicial(perfil?.nombre)}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 25, fontWeight: "800", color: "#10253d" }}>{perfil?.nombre ?? "Sin nombre"}</Text>
            <Text style={{ color: "#516275" }}>{perfil?.correo}</Text>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ color: "#7b5d1d", fontWeight: "800", fontSize: 12 }}>Nombre visible</Text>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor="#9b8f7f"
            selectionColor="#7c2d12"
            style={{
              borderWidth: 1,
              borderColor: "#d8c9ac",
              borderRadius: 18,
              backgroundColor: "#fff",
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: "#16283c"
            }}
          />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ color: "#7b5d1d", fontWeight: "800", fontSize: 12 }}>Ciudad</Text>
          <TextInput
            value={ciudad}
            onChangeText={setCiudad}
            placeholder="Ciudad"
            placeholderTextColor="#9b8f7f"
            selectionColor="#7c2d12"
            style={{
              borderWidth: 1,
              borderColor: "#d8c9ac",
              borderRadius: 18,
              backgroundColor: "#fff",
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: "#16283c"
            }}
          />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ color: "#7b5d1d", fontWeight: "800", fontSize: 12 }}>Presentacion</Text>
          <TextInput
            value={biografia}
            onChangeText={setBiografia}
            placeholder="Cuentale a la comunidad que te gusta ensenar o aprender"
            placeholderTextColor="#9b8f7f"
            selectionColor="#7c2d12"
            multiline
            style={{
              borderWidth: 1,
              borderColor: "#d8c9ac",
              borderRadius: 18,
              backgroundColor: "#fff",
              paddingHorizontal: 16,
              paddingVertical: 14,
              minHeight: 110,
              textAlignVertical: "top",
              color: "#16283c"
            }}
          />
        </View>

        <Pressable
          onPress={() => actualizarPerfilMutation.mutate()}
          disabled={actualizarPerfilMutation.isPending}
          style={{
            backgroundColor: actualizarPerfilMutation.isPending ? "#b59b8c" : "#0e1b2c",
            paddingVertical: 15,
            borderRadius: 18,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff5df", fontWeight: "700" }}>
            {actualizarPerfilMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Text>
        </Pressable>
      </Tarjeta>

      <Tarjeta>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Habilidades que ofreces</Text>
        {habilidadesOfrecidas.map((habilidadUsuario) => (
          <View
            key={habilidadUsuario.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              backgroundColor: "#f5efe4",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#eadfc9"
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: "#30445a", fontWeight: "800" }}>{habilidadUsuario.habilidad.nombre}</Text>
              <Text style={{ color: "#66778a", fontSize: 12 }}>{formatearNivel(habilidadUsuario.nivel)}</Text>
            </View>
            <Pressable
              onPress={() => eliminarHabilidadMutation.mutate(habilidadUsuario.id)}
              disabled={eliminarHabilidadMutation.isPending}
            >
              <Text style={{ color: "#9f3d3d", fontWeight: "700" }}>Quitar</Text>
            </Pressable>
          </View>
        ))}
        {!habilidadesOfrecidas.length ? <Text style={{ color: "#66778a" }}>Aun no has anadido ninguna.</Text> : null}
      </Tarjeta>

      <Tarjeta>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#10253d" }}>Habilidades que quieres aprender</Text>
        {habilidadesDeseadas.map((habilidadUsuario) => (
          <View
            key={habilidadUsuario.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              backgroundColor: "#f5efe4",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#eadfc9"
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: "#30445a", fontWeight: "800" }}>{habilidadUsuario.habilidad.nombre}</Text>
              <Text style={{ color: "#66778a", fontSize: 12 }}>{formatearNivel(habilidadUsuario.nivel)}</Text>
            </View>
            <Pressable
              onPress={() => eliminarHabilidadMutation.mutate(habilidadUsuario.id)}
              disabled={eliminarHabilidadMutation.isPending}
            >
              <Text style={{ color: "#9f3d3d", fontWeight: "700" }}>Quitar</Text>
            </Pressable>
          </View>
        ))}
        {!habilidadesDeseadas.length ? <Text style={{ color: "#66778a" }}>Aun no has anadido ninguna.</Text> : null}
      </Tarjeta>

      <Tarjeta>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#10253d" }}>Disponibilidad</Text>
          <Text style={{ color: "#66778a", lineHeight: 20 }}>
            Indica cuando sueles poder quedar para que las sesiones se puedan organizar con sentido.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {DIAS_SEMANA.map((dia) => (
            <Pressable
              key={dia.valor}
              onPress={() => setDiaSemana(dia.valor)}
              style={{
                backgroundColor: diaSemana === dia.valor ? "#10253d" : "#f3ecdf",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 9
              }}
            >
              <Text style={{ color: diaSemana === dia.valor ? "#fff2d4" : "#314559", fontWeight: "700" }}>
                {dia.etiqueta}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ color: "#7b5d1d", fontWeight: "800", fontSize: 12 }}>Desde</Text>
            <TextInput
              value={horaInicio}
              onChangeText={setHoraInicio}
              placeholder="18:00"
              keyboardType="numbers-and-punctuation"
              placeholderTextColor="#9b8f7f"
              selectionColor="#7c2d12"
              style={{
                borderWidth: 1,
                borderColor: "#d8c9ac",
                borderRadius: 18,
                backgroundColor: "#fff",
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: "#16283c"
              }}
            />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ color: "#7b5d1d", fontWeight: "800", fontSize: 12 }}>Hasta</Text>
            <TextInput
              value={horaFin}
              onChangeText={setHoraFin}
              placeholder="20:00"
              keyboardType="numbers-and-punctuation"
              placeholderTextColor="#9b8f7f"
              selectionColor="#7c2d12"
              style={{
                borderWidth: 1,
                borderColor: "#d8c9ac",
                borderRadius: 18,
                backgroundColor: "#fff",
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: "#16283c"
              }}
            />
          </View>
        </View>

        <Pressable
          onPress={() => crearDisponibilidadMutation.mutate()}
          disabled={crearDisponibilidadMutation.isPending}
          style={{
            backgroundColor: crearDisponibilidadMutation.isPending ? "#b59b8c" : "#0e1b2c",
            paddingVertical: 15,
            borderRadius: 18,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff5df", fontWeight: "700" }}>
            {crearDisponibilidadMutation.isPending ? "Guardando..." : "Anadir disponibilidad"}
          </Text>
        </Pressable>

        {consultaDisponibilidad.isLoading ? (
          <EstadoVacio
            titulo="Cargando disponibilidad"
            descripcion="Estamos revisando los huecos que ya tienes guardados."
          />
        ) : null}

        {consultaDisponibilidad.error ? (
          <EstadoVacio
            titulo="No se pudo cargar la disponibilidad"
            descripcion={consultaDisponibilidad.error instanceof Error ? consultaDisponibilidad.error.message : "Ha ocurrido un error inesperado."}
          />
        ) : null}

        {disponibilidades.map((disponibilidad) => (
          <View
            key={disponibilidad.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              backgroundColor: "#f5efe4",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "#eadfc9"
            }}
          >
            <Text style={{ color: "#30445a", flex: 1 }}>
              {obtenerEtiquetaDia(disponibilidad.diaSemana)} de {formatearHoraDisponibilidad(disponibilidad.horaInicio)} a{" "}
              {formatearHoraDisponibilidad(disponibilidad.horaFin)}
            </Text>
            <Pressable
              onPress={() => eliminarDisponibilidadMutation.mutate(disponibilidad.id)}
              disabled={eliminarDisponibilidadMutation.isPending}
            >
              <Text style={{ color: "#9f3d3d", fontWeight: "700" }}>Quitar</Text>
            </Pressable>
          </View>
        ))}

        {!consultaDisponibilidad.isLoading && !consultaDisponibilidad.error && disponibilidades.length === 0 ? (
          <Text style={{ color: "#66778a" }}>Todavia no has indicado disponibilidad.</Text>
        ) : null}
      </Tarjeta>

      <Pressable
        onPress={cerrarSesion}
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
    </Pantalla>
  );
}
