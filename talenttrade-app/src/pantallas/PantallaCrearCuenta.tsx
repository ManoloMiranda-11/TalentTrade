import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text } from "react-native";
import { z } from "zod";

import { CabeceraDestacada } from "../componentes/CabeceraDestacada";
import { Tarjeta } from "../componentes/Tarjeta";
import { CampoFormulario } from "../componentes/CampoFormulario";
import { Pantalla } from "../componentes/Pantalla";
import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";

const esquema = z.object({
  nombre: z.string().min(2, "Introduce tu nombre."),
  correo: z.string().email("Introduce un correo valido."),
  contrasena: z.string().min(6, "La contrasena debe tener al menos 6 caracteres.")
});

type DatosFormulario = z.infer<typeof esquema>;

export function PantallaCrearCuenta() {
  const { crearCuenta } = useAutenticacion();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: "",
      correo: "",
      contrasena: ""
    }
  });

  const alEnviar = handleSubmit(async (datosFormulario) => {
    try {
      await crearCuenta(datosFormulario.nombre, datosFormulario.correo, datosFormulario.contrasena);
    } catch (errorCapturado) {
      Alert.alert("No se pudo crear la cuenta", errorCapturado instanceof Error ? errorCapturado.message : "Error inesperado.");
    }
  });

  return (
    <Pantalla scroll>
      <CabeceraDestacada
        titulo="Crear cuenta"
        subtitulo="Prepara tu perfil para empezar a encontrar personas con las que intercambiar habilidades."
      />

      <Tarjeta>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#13293f" }}>Crear cuenta</Text>

        <Controller
          control={control}
          name="nombre"
          render={({ field: { value: valor, onChange: alCambiar } }) => (
            <CampoFormulario
              etiqueta="Nombre"
              valor={valor}
              alCambiarTexto={alCambiar}
              placeholder="Como quieres que te vean"
              mensajeError={errors.nombre?.message}
            />
          )}
        />

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
              placeholder="Elige una contrasena segura"
              secureTextEntry
              mensajeError={errors.contrasena?.message}
              autoCapitalize="none"
              textContentType="newPassword"
              autoComplete="password-new"
            />
          )}
        />

        <Pressable
          onPress={alEnviar}
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? "#b59b8c" : "#7c2d12",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff6e8", fontWeight: "700", fontSize: 16 }}>
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Text>
        </Pressable>
      </Tarjeta>
    </Pantalla>
  );
}
