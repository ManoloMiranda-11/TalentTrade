import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PropiedadesPantalla = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Pantalla({ children, scroll = false }: PropiedadesPantalla) {
  const contenido = scroll ? (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 34, gap: 18 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24, gap: 18 }}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3efe6" }} edges={["bottom"]}>
      <View
        style={{
          position: "absolute",
          top: -110,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: 999,
          backgroundColor: "#e2d2b0"
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 180,
          left: -80,
          width: 190,
          height: 190,
          borderRadius: 999,
          backgroundColor: "#d7e2e0"
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -95,
          right: -70,
          width: 230,
          height: 230,
          borderRadius: 999,
          backgroundColor: "#efe1c7"
        }}
      />
      <View style={{ flex: 1 }}>{contenido}</View>
    </SafeAreaView>
  );
}
