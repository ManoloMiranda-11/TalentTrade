import { URL_API } from "../configuracion/configuracionApi";

type OpcionesPeticion = RequestInit & {
  token?: string | null;
};

export async function peticionApi<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const cabeceras = new Headers(opciones.headers ?? {});

  if (!cabeceras.has("Content-Type") && opciones.body) {
    cabeceras.set("Content-Type", "application/json");
  }

  if (opciones.token) {
    cabeceras.set("Authorization", `Bearer ${opciones.token}`);
  }

  const respuesta = await fetch(`${URL_API}${ruta}`, {
    ...opciones,
    headers: cabeceras
  });

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(datos?.mensaje ?? datos?.message ?? "Ha ocurrido un error al conectar con el servidor.");
  }

  return datos as T;
}
