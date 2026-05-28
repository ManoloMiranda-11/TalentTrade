import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Alert, Pressable, Text } from "react-native";
import { z } from "zod";

import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { Tarjeta } from "../componentes/Tarjeta";
import { CampoFormulario } from "../componentes/CampoFormulario";
import { Pantalla } from "../componentes/Pantalla";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";

const esquema = z.object({
  correo: z.string().email("Introduce un correo válido."),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.")
});

type ErroresFormulario = Partial<Record<"correo" | "contrasena", string>>;

export function PantallaInicioSesion() {
  const navegacion = useNavigation();
  const { iniciarSesion } = useAutenticacion();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [enviando, setEnviando] = useState(false);

  async function alEnviar() {
    const resultado = esquema.safeParse({ correo, contrasena });

    if (!resultado.success) {
      const erroresPorCampo: ErroresFormulario = {};
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0];
        if (campo === "correo" || campo === "contrasena") {
          erroresPorCampo[campo] = problema.message;
        }
      }
      setErrores(erroresPorCampo);
      return;
    }

    setErrores({});
    setEnviando(true);

    try {
      await iniciarSesion(resultado.data.correo, resultado.data.contrasena);
    } catch (errorCapturado) {
      Alert.alert("No se pudo iniciar sesión", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="TalentTrade"
        subtitulo="Comparte lo que sabes, encuentra personas compatibles y organiza intercambios útiles de forma sencilla."
      />

      <Tarjeta>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#13293f" }}>Entrar</Text>

        <CampoFormulario
          etiqueta="Correo"
          valor={correo}
          alCambiarTexto={setCorreo}
          placeholder="tu_correo@dominio.es"
          mensajeError={errores.correo}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />

        <CampoFormulario
          etiqueta="Contraseña"
          valor={contrasena}
          alCambiarTexto={setContrasena}
          placeholder="Tu contraseña"
          secureTextEntry
          mensajeError={errores.contrasena}
          autoCapitalize="none"
          textContentType="password"
          autoComplete="password"
        />

        <Pressable
          onPress={alEnviar}
          disabled={enviando}
          style={{
            backgroundColor: enviando ? "#b59b8c" : "#0e1b2c",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff7e0", fontWeight: "700", fontSize: 16 }}>
            {enviando ? "Entrando..." : "Entrar"}
          </Text>
        </Pressable>
      </Tarjeta>

      <Pressable
        onPress={() => navegacion.navigate("Crear cuenta" as never)}
        style={{
          backgroundColor: "#f0e4cc",
          paddingVertical: 14,
          borderRadius: 18
        }}
      >
        <Text style={{ textAlign: "center", color: "#0d2137", fontWeight: "700" }}>
          ¿Todavía no tienes cuenta? Crea la tuya ahora
        </Text>
      </Pressable>
    </Pantalla>
  );
}
