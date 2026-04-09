import type { Server } from "socket.io";

import { prisma } from "../lib/prisma.js";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on("conversation:join", async (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on(
      "message:send",
      async (payload: { conversationId: string; content: string; senderId: string }) => {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: payload.conversationId,
            match: {
              status: "ACCEPTED",
              OR: [{ requesterId: payload.senderId }, { receiverId: payload.senderId }]
            }
          }
        });

        if (!conversation) {
          socket.emit("message:error", {
            message: "No tienes acceso a esta conversacion."
          });
          return;
        }

        const content = payload.content.trim();

        if (!content) {
          socket.emit("message:error", {
            message: "El mensaje no puede estar vacio."
          });
          return;
        }

        const message = await prisma.message.create({
          data: {
            conversationId: payload.conversationId,
            senderId: payload.senderId,
            content
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        });

        io.to(payload.conversationId).emit("message:new", {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          isRead: message.isRead,
          createdAt: message.createdAt,
          sender: message.sender
        });
      }
    );

    socket.on("message:read", async (conversationId: string, userId: string) => {
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: {
            not: userId
          },
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      socket.to(conversationId).emit("message:read", {
        conversationId,
        userId
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
