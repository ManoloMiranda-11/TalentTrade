import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

export const messageRouter = Router();

messageRouter.get("/:conversationId", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de listar mensajes." });
});
