import type { PropsWithChildren } from "react";
import { View } from "react-native";

export function Tarjeta({ children }: PropsWithChildren) {
  return (
    <View
      style={{
        backgroundColor: "#fffdf9",
        borderRadius: 26,
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: "#e7dbc6",
        shadowColor: "#2d1d0d",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 24,
        elevation: 3,
        gap: 12
      }}
    >
      {children}
    </View>
  );
}
