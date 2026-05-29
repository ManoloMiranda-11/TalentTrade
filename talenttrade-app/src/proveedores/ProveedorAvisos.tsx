import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { Animated, Easing, Platform, Pressable, Text, View } from "react-native";

const USAR_DRIVER_NATIVO = Platform.OS !== "web";

type TipoAviso = "exito" | "error" | "info";

type AccionAviso = {
  etiqueta: string;
  alPulsar: () => void;
};

type AvisoActivo = {
  id: number;
  tipo: TipoAviso;
  titulo: string;
  mensaje?: string;
  accion?: AccionAviso;
};

type ApiAvisos = {
  exito: (titulo: string, mensaje?: string, accion?: AccionAviso) => void;
  error: (titulo: string, mensaje?: string, accion?: AccionAviso) => void;
  info: (titulo: string, mensaje?: string, accion?: AccionAviso) => void;
};

const ContextoAvisos = createContext<ApiAvisos | null>(null);

const ESTILOS_POR_TIPO = {
  exito: { fondo: "#e2f1d7", borde: "#6f9a4f", texto: "#22451a", icono: "✓" },
  error: { fondo: "#f6dadb", borde: "#b94a4a", texto: "#5a1d1d", icono: "!" },
  info: { fondo: "#fff4dc", borde: "#c79a55", texto: "#5b431f", icono: "i" }
} as const;

export function ProveedorAvisos({ children }: PropsWithChildren) {
  const [aviso, setAviso] = useState<AvisoActivo | null>(null);
  const animacionOpacidad = useRef(new Animated.Value(0)).current;
  const animacionDesplazamiento = useRef(new Animated.Value(-16)).current;
  const referenciaTemporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siguienteId = useRef(0);

  const cerrar = useCallback(() => {
    if (referenciaTemporizador.current) {
      clearTimeout(referenciaTemporizador.current);
      referenciaTemporizador.current = null;
    }

    Animated.parallel([
      Animated.timing(animacionOpacidad, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: USAR_DRIVER_NATIVO
      }),
      Animated.timing(animacionDesplazamiento, {
        toValue: -16,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: USAR_DRIVER_NATIVO
      })
    ]).start(() => setAviso(null));
  }, [animacionOpacidad, animacionDesplazamiento]);

  const mostrar = useCallback(
    (tipo: TipoAviso, titulo: string, mensaje?: string, accion?: AccionAviso) => {
      siguienteId.current += 1;
      setAviso({ id: siguienteId.current, tipo, titulo, mensaje, accion });

      animacionOpacidad.setValue(0);
      animacionDesplazamiento.setValue(-16);

      Animated.parallel([
        Animated.timing(animacionOpacidad, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USAR_DRIVER_NATIVO
        }),
        Animated.timing(animacionDesplazamiento, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USAR_DRIVER_NATIVO
        })
      ]).start();

      if (referenciaTemporizador.current) {
        clearTimeout(referenciaTemporizador.current);
      }
      const duracion = tipo === "error" ? 6000 : 4500;
      referenciaTemporizador.current = setTimeout(cerrar, duracion);
    },
    [animacionOpacidad, animacionDesplazamiento, cerrar]
  );

  useEffect(() => {
    return () => {
      if (referenciaTemporizador.current) {
        clearTimeout(referenciaTemporizador.current);
      }
    };
  }, []);

  const api = useMemo<ApiAvisos>(
    () => ({
      exito: (titulo, mensaje, accion) => mostrar("exito", titulo, mensaje, accion),
      error: (titulo, mensaje, accion) => mostrar("error", titulo, mensaje, accion),
      info: (titulo, mensaje, accion) => mostrar("info", titulo, mensaje, accion)
    }),
    [mostrar]
  );

  const estilos = aviso ? ESTILOS_POR_TIPO[aviso.tipo] : null;

  return (
    <ContextoAvisos.Provider value={api}>
      {children}
      {aviso && estilos ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            paddingTop: Platform.OS === "web" ? 24 : 56,
            paddingHorizontal: 16
          }}
        >
          <Animated.View
            style={{
              opacity: animacionOpacidad,
              transform: [{ translateY: animacionDesplazamiento }],
              maxWidth: 480,
              width: "100%",
              backgroundColor: estilos.fondo,
              borderLeftWidth: 6,
              borderLeftColor: estilos.borde,
              borderRadius: 18,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: "row",
              gap: 12,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 12,
              elevation: 6
            }}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                backgroundColor: estilos.borde,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}>{estilos.icono}</Text>
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: estilos.texto, fontWeight: "800", fontSize: 15 }}>{aviso.titulo}</Text>
              {aviso.mensaje ? (
                <Text style={{ color: estilos.texto, fontSize: 13, lineHeight: 18 }}>{aviso.mensaje}</Text>
              ) : null}
              {aviso.accion ? (
                <Pressable
                  onPress={() => {
                    aviso.accion?.alPulsar();
                    cerrar();
                  }}
                  style={{ alignSelf: "flex-start", marginTop: 6 }}
                  hitSlop={6}
                >
                  <Text style={{ color: estilos.texto, fontWeight: "800", textDecorationLine: "underline" }}>
                    {aviso.accion.etiqueta}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <Pressable onPress={cerrar} hitSlop={10}>
              <Text style={{ color: estilos.texto, fontWeight: "900", fontSize: 20, lineHeight: 22 }}>×</Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
    </ContextoAvisos.Provider>
  );
}

export function useAviso() {
  const contexto = useContext(ContextoAvisos);

  if (!contexto) {
    throw new Error("useAviso debe usarse dentro de ProveedorAvisos.");
  }

  return contexto;
}
