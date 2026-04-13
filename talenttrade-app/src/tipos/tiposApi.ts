export type Usuario = {
  id: string;
  correo: string;
  nombre: string;
  biografia: string | null;
  urlAvatar: string | null;
  ciudad: string | null;
  latitud: number | null;
  longitud: number | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  habilidadesOfrecidas?: HabilidadUsuario[];
  habilidadesDeseadas?: HabilidadUsuario[];
};

export type Habilidad = {
  id: string;
  nombre: string;
  categoria: string | null;
  icono: string | null;
};

export type HabilidadUsuario = {
  id: string;
  tipo: "OFRECER" | "APRENDER";
  nivel: "INICIAL" | "MEDIO" | "AVANZADO";
  fechaCreacion?: string;
  habilidad: Habilidad;
};

export type RespuestaAutenticacion = {
  mensaje: string;
  token: string;
  usuario: Usuario;
};

export type SugerenciaCoincidencia = {
  usuario: {
    id: string;
    nombre: string;
    urlAvatar: string | null;
    ciudad: string | null;
    biografia: string | null;
  };
  compatibilidad: {
    habilidadOfrecidaPorSolicitante: Habilidad;
    habilidadDeseadaPorSolicitante: Habilidad;
    habilidadOfrecidaPorCandidato: Habilidad;
    habilidadDeseadaPorCandidato: Habilidad;
  };
};

export type Coincidencia = {
  id: string;
  estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA";
  solicitanteId: string;
  receptorId: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  solicitante: {
    id: string;
    nombre: string;
    urlAvatar: string | null;
    ciudad: string | null;
  };
  receptor: {
    id: string;
    nombre: string;
    urlAvatar: string | null;
    ciudad: string | null;
  };
  habilidadOfrecidaPorSolicitante: Habilidad;
  habilidadSolicitadaPorSolicitante: Habilidad;
  conversacion: {
    id: string;
    fechaCreacion: string;
  } | null;
};

export type Mensaje = {
  id: string;
  conversacionId: string;
  remitenteId: string;
  contenido: string;
  leido: boolean;
  fechaCreacion: string;
  remitente: {
    id: string;
    nombre: string;
    urlAvatar: string | null;
  };
};

export type Sesion = {
  id: string;
  coincidenciaId: string;
  habilidadId: string;
  profesorId: string;
  aprendizId: string;
  fechaProgramada: string;
  duracionMinutos: number;
  estado: "PROGRAMADA" | "COMPLETADA" | "CANCELADA";
  fechaCreacion: string;
  fechaActualizacion: string;
  habilidad: Habilidad;
  profesor: {
    id: string;
    nombre: string;
    urlAvatar: string | null;
    ciudad: string | null;
  };
  aprendiz: {
    id: string;
    nombre: string;
    urlAvatar: string | null;
    ciudad: string | null;
  };
};

export type Valoracion = {
  id: string;
  sesionId: string;
  valoradorId: string;
  valoradoId: string;
  puntuacion: number;
  comentario: string | null;
  fechaCreacion: string;
  autor: {
    id: string;
    nombre: string;
    urlAvatar: string | null;
  };
  valorado: {
    id: string;
    nombre: string;
    urlAvatar: string | null;
  };
};

export type DiaSemana = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export type Disponibilidad = {
  id: string;
  usuarioId: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  fechaCreacion: string;
};
