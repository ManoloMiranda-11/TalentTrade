import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

type EstadoVacioProps = PropsWithChildren<{
  titulo: string;
  descripcion: string;
}>;

export function EstadoVacio({ titulo, descripcion, children }: EstadoVacioProps) {
  return (
    <View
      style={{
        backgroundColor: "#fbf7ef",
        borderRadius: 24,
        padding: 22,
        borderWidth: 1,
        borderColor: "#e4d7bf",
        gap: 10
      }}
    >
      <View
        style={{
          width: 42,
          height: 6,
          borderRadius: 999,
          backgroundColor: "#c18d45"
        }}
      />
      <Text style={{ fontSize: 21, fontWeight: "700", color: "#12283f" }}>{titulo}</Text>
      <Text style={{ color: "#5f6f81", lineHeight: 22 }}>{descripcion}</Text>
      {children}
    </View>
  );
}
