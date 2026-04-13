import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text } from "react-native";
import { z } from "zod";

import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { Tarjeta } from "../componentes/Tarjeta";
import { CampoFormulario } from "../componentes/CampoFormulario";
import { Pantalla } from "../componentes/Pantalla";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";

const esquema = z.object({
  correo: z.string().email("Introduce un correo valido."),
  contrasena: z.string().min(6, "La contrasena debe tener al menos 6 caracteres.")
});

type DatosFormulario = z.infer<typeof esquema>;

export function PantallaInicioSesion() {
  const navegacion = useNavigation();
  const { iniciarSesion } = useAutenticacion();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      correo: "",
      contrasena: ""
    }
  });

  const alEnviar = handleSubmit(async (datosFormulario) => {
    try {
      await iniciarSesion(datosFormulario.correo, datosFormulario.contrasena);
    } catch (errorCapturado) {
      Alert.alert("No se pudo iniciar sesion", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="TalentTrade"
        subtitulo="Comparte lo que sabes, encuentra personas compatibles y organiza intercambios utiles de forma sencilla."
      />

      <Tarjeta>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#13293f" }}>Entrar</Text>

        <Controller
          control={control}
          name="correo"
          render={({ field: { value: valor, onChange: alCambiar } }) => (
            <CampoFormulario
              etiqueta="Correo"
              valor={valor}
              alCambiarTexto={alCambiar}
              placeholder="tu_correo@dominio.es"
              mensajeError={errors.correo?.message}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
          )}
        />

        <Controller
          control={control}
          name="contrasena"
          render={({ field: { value: valor, onChange: alCambiar } }) => (
            <CampoFormulario
              etiqueta="Contrasena"
              valor={valor}
              alCambiarTexto={alCambiar}
              placeholder="Tu contrasena"
              secureTextEntry
              mensajeError={errors.contrasena?.message}
              autoCapitalize="none"
              textContentType="password"
              autoComplete="password"
            />
          )}
        />

        <Pressable
          onPress={alEnviar}
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? "#b59b8c" : "#0e1b2c",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff7e0", fontWeight: "700", fontSize: 16 }}>
            {isSubmitting ? "Entrando..." : "Entrar"}
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
          Todavia no tienes cuenta? Crea la tuya ahora
        </Text>
      </Pressable>
    </Pantalla>
  );
}
