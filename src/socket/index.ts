import type { Server } from "socket.io";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on("conversation:join", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on("message:send", (payload: { conversationId: string; content: string; senderId: string }) => {
      io.to(payload.conversationId).emit("message:new", {
        ...payload,
        createdAt: new Date().toISOString()
      });
    });

    socket.on("typing:start", (conversationId: string) => {
      socket.to(conversationId).emit("typing:start", { socketId: socket.id });
    });

    socket.on("typing:stop", (conversationId: string) => {
      socket.to(conversationId).emit("typing:stop", { socketId: socket.id });
    });

    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
}
