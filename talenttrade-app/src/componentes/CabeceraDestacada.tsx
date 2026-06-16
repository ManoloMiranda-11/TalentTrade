import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

type PropiedadesCabeceraDestacada = PropsWithChildren<{
  titulo: string;
  subtitulo: string;
}>;

export function CabeceraDestacada({ titulo, subtitulo, children }: PropiedadesCabeceraDestacada) {
  return (
    <View
      style={{
        backgroundColor: "#10253d",
        borderRadius: 30,
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 24,
        gap: 12,
        overflow: "hidden",
        shadowColor: "#081321",
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 16 },
        shadowRadius: 28,
        elevation: 4
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -36,
          right: -28,
          width: 150,
          height: 150,
          borderRadius: 999,
          backgroundColor: "#c18d45"
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -54,
          left: -12,
          width: 140,
          height: 140,
          borderRadius: 999,
          backgroundColor: "#244a6b"
        }}
      />
      <Text
        style={{
          fontSize: 31,
          fontWeight: "800",
          color: "#fff4dc",
          letterSpacing: 0.2
        }}
      >
        {titulo}
      </Text>
      <Text style={{ color: "#d7dfeb", lineHeight: 23, maxWidth: "88%" }}>{subtitulo}</Text>
      {children}
    </View>
  );
}
