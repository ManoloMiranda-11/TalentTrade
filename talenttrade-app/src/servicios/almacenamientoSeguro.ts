import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const disponibleEnWeb = typeof globalThis !== "undefined" && typeof globalThis.localStorage !== "undefined";

export async function guardarValor(clave: string, valor: string): Promise<void> {
  if (Platform.OS === "web") {
    if (disponibleEnWeb) {
      globalThis.localStorage.setItem(clave, valor);
    }
    return;
  }

  await SecureStore.setItemAsync(clave, valor);
}

export async function leerValor(clave: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (!disponibleEnWeb) {
      return null;
    }
    return globalThis.localStorage.getItem(clave);
  }

  return SecureStore.getItemAsync(clave);
}

export async function borrarValor(clave: string): Promise<void> {
  if (Platform.OS === "web") {
    if (disponibleEnWeb) {
      globalThis.localStorage.removeItem(clave);
    }
    return;
  }

  await SecureStore.deleteItemAsync(clave);
}
