import { useState } from "react";
import { Pressable, Text } from "react-native";
import { z } from "zod";

import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { Tarjeta } from "../componentes/Tarjeta";
import { CampoFormulario } from "../componentes/CampoFormulario";
import { Pantalla } from "../componentes/Pantalla";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";
import { useAviso } from "../proveedores/ProveedorAvisos";

const esquema = z.object({
  nombre: z.string().min(2, "Introduce tu nombre."),
  correo: z.string().email("Introduce un correo válido."),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.")
});

type ErroresFormulario = Partial<Record<"nombre" | "correo" | "contrasena", string>>;

export function PantallaCrearCuenta() {
  const { crearCuenta } = useAutenticacion();
  const aviso = useAviso();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [enviando, setEnviando] = useState(false);

  async function alEnviar() {
    const resultado = esquema.safeParse({ nombre, correo, contrasena });

    if (!resultado.success) {
      const erroresPorCampo: ErroresFormulario = {};
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0];
        if (campo === "nombre" || campo === "correo" || campo === "contrasena") {
          erroresPorCampo[campo] = problema.message;
        }
      }
      setErrores(erroresPorCampo);
      return;
    }

    setErrores({});
    setEnviando(true);

    try {
      await crearCuenta(resultado.data.nombre, resultado.data.correo, resultado.data.contrasena);
      aviso.exito("Cuenta creada", "Te hemos identificado y ya puedes empezar a usar TalentTrade.");
    } catch (errorCapturado) {
      aviso.error(
        "No se pudo crear la cuenta",
        errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="Crear cuenta"
        subtitulo="Prepara tu perfil para empezar a encontrar personas con las que intercambiar habilidades."
      />

      <Tarjeta>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#13293f" }}>Crear cuenta</Text>

        <CampoFormulario
          etiqueta="Nombre"
          valor={nombre}
          alCambiarTexto={setNombre}
          placeholder="Cómo quieres que te vean"
          mensajeError={errores.nombre}
        />

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
          placeholder="Elige una contraseña segura"
          secureTextEntry
          mensajeError={errores.contrasena}
          autoCapitalize="none"
          textContentType="newPassword"
          autoComplete="password-new"
        />

        <Pressable
          onPress={alEnviar}
          disabled={enviando}
          style={{
            backgroundColor: enviando ? "#b59b8c" : "#7c2d12",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff6e8", fontWeight: "700", fontSize: 16 }}>
            {enviando ? "Creando cuenta..." : "Crear cuenta"}
          </Text>
        </Pressable>
      </Tarjeta>
    </Pantalla>
  );
}
