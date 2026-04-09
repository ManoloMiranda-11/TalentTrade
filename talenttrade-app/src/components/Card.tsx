import type { PropsWithChildren } from "react";
import { View } from "react-native";

export function Card({ children }: PropsWithChildren) {
  return (
    <View
      style={{
        backgroundColor: "#fffdf7",
        borderRadius: 22,
        padding: 18,
        borderWidth: 1,
        borderColor: "#eadfca",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 2,
        gap: 10
      }}
    >
      {children}
    </View>
  );
}
