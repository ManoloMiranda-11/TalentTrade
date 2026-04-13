import { Platform } from "react-native";

export const URL_API =
  Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";
