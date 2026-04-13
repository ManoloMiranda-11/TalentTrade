import http from "node:http";

import { Server } from "socket.io";

import { app } from "./app.js";
import { registrarManejadoresSocket } from "./tiempoReal/manejadores.js";

const puerto = Number(process.env.PORT ?? 4000);
const servidorHttp = http.createServer(app);

const io = new Server(servidorHttp, {
  cors: {
    origin: process.env.CLIENT_URL ?? "*"
  }
});

registrarManejadoresSocket(io);

servidorHttp.listen(puerto, () => {
  console.log(`Servidor de TalentTrade escuchando en http://localhost:${puerto}`);
});
