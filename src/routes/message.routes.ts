import { Router } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { serializeMessage } from "../lib/serializers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const messageRouter = Router();

const conversationParamsSchema = z.object({
  conversationId: z.string().uuid("conversationId debe ser un UUID valido.")
});

const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacio.")
    .max(1000, "El mensaje es demasiado largo.")
});

async function ensureConversationAccess(conversationId: string, userId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      match: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { receiverId: userId }]
      }
    },
    include: {
      match: true
    }
  });
}

messageRouter.get("/:conversationId", requireAuth, async (req, res) => {
  const { conversationId } = conversationParamsSchema.parse(req.params);
  const currentUserId = req.user!.sub;

  const conversation = await ensureConversationAccess(conversationId, currentUserId);

  if (!conversation) {
    return res.status(404).json({
      message: "No tienes acceso a esta conversacion."
    });
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId
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

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: {
        not: currentUserId
      },
      isRead: false
    },
    data: {
      isRead: true
    }
  });

  return res.status(200).json({
    conversacionId: conversationId,
    mensajes: messages.map(serializeMessage)
  });
});

messageRouter.post("/:conversationId", requireAuth, async (req, res) => {
  const { conversationId } = conversationParamsSchema.parse(req.params);
  const { content } = createMessageSchema.parse(req.body);
  const currentUserId = req.user!.sub;

  const conversation = await ensureConversationAccess(conversationId, currentUserId);

  if (!conversation) {
    return res.status(404).json({
      message: "No tienes acceso a esta conversacion."
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: currentUserId,
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

  return res.status(201).json({
    message: "Mensaje enviado correctamente.",
    datos: serializeMessage(message)
  });
});
