import type { Server } from "socket.io";

import { prisma } from "../utilidades/prisma.js";

export function registrarManejadoresSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on("conversacion:unirse", async (conversacionId: string) => {
      socket.join(conversacionId);
    });

    socket.on(
      "mensaje:enviar",
      async (datosEntrada: { conversacionId: string; contenido: string; remitenteId: string }) => {
        const conversacion = await prisma.conversation.findFirst({
          where: {
            id: datosEntrada.conversacionId,
            match: {
              status: "ACCEPTED",
              OR: [{ requesterId: datosEntrada.remitenteId }, { receiverId: datosEntrada.remitenteId }]
            }
          }
        });

        if (!conversacion) {
          socket.emit("mensaje:error", {
            mensaje: "No tienes acceso a esta conversacion."
          });
          return;
        }

        const contenido = datosEntrada.contenido.trim();

        if (!contenido) {
          socket.emit("mensaje:error", {
            mensaje: "El mensaje no puede estar vacio."
          });
          return;
        }

        const mensaje = await prisma.message.create({
          data: {
            conversationId: datosEntrada.conversacionId,
            senderId: datosEntrada.remitenteId,
            content: contenido
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

        io.to(datosEntrada.conversacionId).emit("mensaje:nuevo", {
          id: mensaje.id,
          conversacionId: mensaje.conversationId,
          remitenteId: mensaje.senderId,
          contenido: mensaje.content,
          leido: mensaje.isRead,
          fechaCreacion: mensaje.createdAt,
          remitente: mensaje.sender
        });
      }
    );

    socket.on("mensaje:leido", async (conversacionId: string, usuarioId: string) => {
      await prisma.message.updateMany({
        where: {
          conversationId: conversacionId,
          senderId: {
            not: usuarioId
          },
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      socket.to(conversacionId).emit("mensaje:leido", {
        conversacionId,
        usuarioId
      });
    });

    socket.on("escritura:inicio", (conversacionId: string) => {
      socket.to(conversacionId).emit("escritura:inicio", { idSocket: socket.id });
    });

    socket.on("escritura:fin", (conversacionId: string) => {
      socket.to(conversacionId).emit("escritura:fin", { idSocket: socket.id });
    });

    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });
}
