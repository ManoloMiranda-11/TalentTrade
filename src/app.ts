import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { manejadorErrores, manejadorRutaNoEncontrada } from "./intermediarios/errores.middleware.js";
import { routerApi } from "./rutas/index.js";

dotenv.config();

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "*"
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/salud", (_req, res) => {
  res.status(200).json({
    estado: "ok",
    servicio: "TalentTrade",
    fechaHora: new Date().toISOString()
  });
});

app.use("/api", routerApi);
app.use(manejadorRutaNoEncontrada);
app.use(manejadorErrores);
