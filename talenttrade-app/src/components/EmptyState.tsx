import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View
      style={{
        backgroundColor: "#fffdf7",
        borderRadius: 22,
        padding: 22,
        borderWidth: 1,
        borderColor: "#eadfca",
        gap: 8
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#12283f" }}>{title}</Text>
      <Text style={{ color: "#5f6f81", lineHeight: 22 }}>{description}</Text>
    </View>
  );
}
