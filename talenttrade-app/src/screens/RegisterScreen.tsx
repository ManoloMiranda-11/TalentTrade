import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text } from "react-native";
import { z } from "zod";

import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Screen } from "../components/Screen";
import { useAuth } from "../providers/AuthProvider";

const schema = z.object({
  name: z.string().min(2, "Introduce tu nombre."),
  email: z.string().email("Introduce un email valido."),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres.")
});

type FormData = z.infer<typeof schema>;

export function RegisterScreen() {
  const { signUp } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values.name, values.email, values.password);
    } catch (error) {
      Alert.alert("No se pudo crear la cuenta", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  return (
    <Screen scroll>
      <Card>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#13293f" }}>Crear cuenta</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <FormField
              label="Nombre"
              value={value}
              onChangeText={onChange}
              placeholder="Tu nombre"
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <FormField
              label="Correo"
              value={value}
              onChangeText={onChange}
              placeholder="tu@email.com"
              error={errors.email?.message}
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <FormField
              label="Contrasena"
              value={value}
              onChangeText={onChange}
              placeholder="Minimo 6 caracteres"
              secureTextEntry
              error={errors.password?.message}
              autoCapitalize="none"
            />
          )}
        />

        <Pressable
          onPress={onSubmit}
          style={{
            backgroundColor: "#7c2d12",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff6e8", fontWeight: "700", fontSize: 16 }}>
            {isSubmitting ? "Creando..." : "Crear cuenta"}
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}
