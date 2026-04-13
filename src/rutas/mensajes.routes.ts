import { Router } from "express";
import { z } from "zod";

import { prisma } from "../utilidades/prisma.js";
import { serializarMensaje } from "../utilidades/serializadores.js";
import { requerirAutenticacion } from "../intermediarios/autenticacion.middleware.js";

export const routerMensajes = Router();

const esquemaParametrosConversacion = z.object({
  conversacionId: z.string().uuid("conversacionId debe ser un UUID valido.")
});

const esquemaCrearMensaje = z.object({
  contenido: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacio.")
    .max(1000, "El mensaje es demasiado largo.")
});

async function asegurarAccesoConversacion(conversacionId: string, usuarioId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: conversacionId,
      match: {
        status: "ACCEPTED",
        OR: [{ requesterId: usuarioId }, { receiverId: usuarioId }]
      }
    },
    include: {
      match: true
    }
  });
}

routerMensajes.get("/:conversacionId", requerirAutenticacion, async (req, res) => {
  const { conversacionId } = esquemaParametrosConversacion.parse(req.params);
  const usuarioActualId = req.usuario!.sub;

  const conversacion = await asegurarAccesoConversacion(conversacionId, usuarioActualId);

  if (!conversacion) {
    return res.status(404).json({
      mensaje: "No tienes acceso a esta conversacion."
    });
  }

  await prisma.message.updateMany({
    where: {
      conversationId: conversacionId,
      senderId: {
        not: usuarioActualId
      },
      isRead: false
    },
    data: {
      isRead: true
    }
  });

  const mensajes = await prisma.message.findMany({
    where: {
      conversationId: conversacionId
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return res.status(200).json({
    conversacionId,
    mensajes: mensajes.map(serializarMensaje)
  });
});

routerMensajes.post("/:conversacionId", requerirAutenticacion, async (req, res) => {
  const { conversacionId } = esquemaParametrosConversacion.parse(req.params);
  const { contenido } = esquemaCrearMensaje.parse(req.body);
  const usuarioActualId = req.usuario!.sub;

  const conversacion = await asegurarAccesoConversacion(conversacionId, usuarioActualId);

  if (!conversacion) {
    return res.status(404).json({
      mensaje: "No tienes acceso a esta conversacion."
    });
  }

  const mensaje = await prisma.message.create({
    data: {
      conversationId: conversacionId,
      senderId: usuarioActualId,
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

  return res.status(201).json({
    mensaje: "El mensaje se ha enviado correctamente.",
    datos: serializarMensaje(mensaje)
  });
});
