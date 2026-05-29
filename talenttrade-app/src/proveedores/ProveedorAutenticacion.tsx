import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { borrarValor, guardarValor, leerValor } from "../servicios/almacenamientoSeguro";
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
  const clienteConsultas = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarSesionInicial() {
      try {
        const tokenGuardado = await leerValor(CLAVE_TOKEN);

        if (!tokenGuardado) {
          setCargando(false);
          return;
        }

        setToken(tokenGuardado);
        const perfil = await peticionApi<{ usuario: Usuario }>("/api/usuarios/yo", { token: tokenGuardado });
        setUsuario(perfil.usuario);
      } catch {
        await borrarValor(CLAVE_TOKEN);
        setToken(null);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }

    cargarSesionInicial();
  }, []);

  async function guardarSesion(respuestaAutenticacion: RespuestaAutenticacion) {
    await guardarValor(CLAVE_TOKEN, respuestaAutenticacion.token);
    clienteConsultas.clear();
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
    await borrarValor(CLAVE_TOKEN);
    setToken(null);
    setUsuario(null);
    clienteConsultas.clear();
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
