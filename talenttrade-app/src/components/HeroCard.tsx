import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

type HeroCardProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function HeroCard({ title, subtitle, children }: HeroCardProps) {
  return (
    <View
      style={{
        backgroundColor: "#10253d",
        borderRadius: 28,
        padding: 22,
        gap: 10
      }}
    >
      <Text style={{ fontSize: 30, fontWeight: "800", color: "#fff4dc" }}>{title}</Text>
      <Text style={{ color: "#d7dfeb", lineHeight: 22 }}>{subtitle}</Text>
      {children}
    </View>
  );
}
