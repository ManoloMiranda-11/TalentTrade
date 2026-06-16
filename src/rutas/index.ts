import { Router } from "express";

import { routerDisponibilidad } from "./disponibilidad.routes.js";
import { routerAutenticacion } from "./autenticacion.routes.js";
import { routerCoincidencias } from "./coincidencias.routes.js";
import { routerMensajes } from "./mensajes.routes.js";
import { routerValoraciones } from "./valoraciones.routes.js";
import { routerSesiones } from "./sesiones.routes.js";
import { routerHabilidades } from "./habilidades.routes.js";
import { routerUsuarios } from "./usuarios.routes.js";

export const routerApi = Router();

routerApi.use("/autenticacion", routerAutenticacion);
routerApi.use("/usuarios", routerUsuarios);
routerApi.use("/disponibilidad", routerDisponibilidad);
routerApi.use("/habilidades", routerHabilidades);
routerApi.use("/coincidencias", routerCoincidencias);
routerApi.use("/mensajes", routerMensajes);
routerApi.use("/sesiones", routerSesiones);
routerApi.use("/valoraciones", routerValoraciones);
