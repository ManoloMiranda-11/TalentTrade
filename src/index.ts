import http from "node:http";

import { Server } from "socket.io";

import { app } from "./app.js";
import { registerSocketHandlers } from "./socket/index.js";

const port = Number(process.env.PORT ?? 4000);
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ?? "*"
  }
});

registerSocketHandlers(io);

server.listen(port, () => {
  console.log(`TalentTrade backend escuchando en http://localhost:${port}`);
});
