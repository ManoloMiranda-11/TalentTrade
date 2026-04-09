import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text, View } from "react-native";
import { z } from "zod";

import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { HeroCard } from "../components/HeroCard";
import { Screen } from "../components/Screen";
import { API_URL_HINT } from "../config/api";
import { useAuth } from "../providers/AuthProvider";

const schema = z.object({
  email: z.string().email("Introduce un email valido."),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres.")
});

type FormData = z.infer<typeof schema>;

export function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "ana@example.com",
      password: "123456"
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      Alert.alert("No se pudo iniciar sesion", error instanceof Error ? error.message : "Error inesperado.");
    }
  });

  return (
    <Screen scroll>
      <HeroCard
        title="TalentTrade"
        subtitle={`Intercambia lo que sabes por lo que quieres aprender. Si pruebas desde tu movil, cambia la URL base a tu IP local: ${API_URL_HINT}`}
      />

      <Card>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#13293f" }}>Entrar</Text>

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
              placeholder="123456"
              secureTextEntry
              error={errors.password?.message}
              autoCapitalize="none"
            />
          )}
        />

        <Pressable
          onPress={onSubmit}
          style={{
            backgroundColor: "#0e1b2c",
            paddingVertical: 16,
            borderRadius: 18,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#fff7e0", fontWeight: "700", fontSize: 16 }}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Text>
        </Pressable>
      </Card>

      <Pressable
        onPress={() => navigation.navigate("Crear cuenta" as never)}
        style={{
          backgroundColor: "#f0e4cc",
          paddingVertical: 14,
          borderRadius: 18
        }}
      >
        <Text style={{ textAlign: "center", color: "#0d2137", fontWeight: "700" }}>
          No tienes cuenta? Crear una ahora
        </Text>
      </Pressable>
    </Screen>
  );
}
