import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import { peticionApi } from "../servicios/clienteApi";
import type { RespuestaAutenticacion, Usuario } from "../tipos/tiposApi";

const CLAVE_TOKEN = "talenttrade_token";

type ContextoAutenticacion = {
  token: string | null;
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  crearCuenta: (nombre: string, correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  refrescarUsuario: () => Promise<void>;
};

const ContextoAutenticacion = createContext<ContextoAutenticacion | null>(null);

export function ProveedorAutenticacion({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarSesionInicial() {
      try {
        const tokenGuardado = await SecureStore.getItemAsync(CLAVE_TOKEN);

        if (!tokenGuardado) {
          setCargando(false);
          return;
        }

        setToken(tokenGuardado);
        const perfil = await peticionApi<{ usuario: Usuario }>("/api/usuarios/yo", { token: tokenGuardado });
        setUsuario(perfil.usuario);
      } catch {
        await SecureStore.deleteItemAsync(CLAVE_TOKEN);
        setToken(null);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }

    cargarSesionInicial();
  }, []);

  async function guardarSesion(respuestaAutenticacion: RespuestaAutenticacion) {
    await SecureStore.setItemAsync(CLAVE_TOKEN, respuestaAutenticacion.token);
    setToken(respuestaAutenticacion.token);
    setUsuario(respuestaAutenticacion.usuario);
  }

  async function iniciarSesion(correo: string, contrasena: string) {
    const respuestaAutenticacion = await peticionApi<RespuestaAutenticacion>("/api/autenticacion/inicio-sesion", {
      method: "POST",
      body: JSON.stringify({ correo, contrasena })
    });

    await guardarSesion(respuestaAutenticacion);
  }

  async function crearCuenta(nombre: string, correo: string, contrasena: string) {
    const respuestaAutenticacion = await peticionApi<RespuestaAutenticacion>("/api/autenticacion/registro", {
      method: "POST",
      body: JSON.stringify({ nombre, correo, contrasena })
    });

    await guardarSesion(respuestaAutenticacion);
  }

  async function cerrarSesion() {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
    setToken(null);
    setUsuario(null);
  }

  async function refrescarUsuario() {
    if (!token) {
      return;
    }

    const perfil = await peticionApi<{ usuario: Usuario }>("/api/usuarios/yo", { token });
    setUsuario(perfil.usuario);
  }

  const valorContexto = useMemo<ContextoAutenticacion>(
    () => ({
      token,
      usuario,
      cargando,
      iniciarSesion,
      crearCuenta,
      cerrarSesion,
      refrescarUsuario
    }),
    [token, usuario, cargando]
  );

  return <ContextoAutenticacion.Provider value={valorContexto}>{children}</ContextoAutenticacion.Provider>;
}

export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);

  if (!contexto) {
    throw new Error("useAutenticacion debe usarse dentro de ProveedorAutenticacion.");
  }

  return contexto;
}
