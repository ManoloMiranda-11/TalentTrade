import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = false }: ScreenProps) {
  const content = scroll ? (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>{children}</ScrollView>
  ) : (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f4ea" }} edges={["bottom"]}>
      {content}
    </SafeAreaView>
  );
}
