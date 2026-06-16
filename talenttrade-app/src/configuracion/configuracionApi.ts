import Constants from "expo-constants";
import { Platform } from "react-native";

const PUERTO_API = 4000;

// En un dispositivo físico, "localhost" apunta al propio teléfono, no al PC
// donde corre el servidor. Expo ya conoce la IP del PC (la que sirve Metro),
// así que la reutilizamos para llegar al backend desde cualquier red.
function obtenerUrlApi(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? "";
  const host = hostUri.split(":")[0];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:${PUERTO_API}`;
  }

  // Emulador de Android o simulador de iOS (sin dispositivo físico).
  return Platform.OS === "android"
    ? `http://10.0.2.2:${PUERTO_API}`
    : `http://localhost:${PUERTO_API}`;
}

export const URL_API = obtenerUrlApi();
