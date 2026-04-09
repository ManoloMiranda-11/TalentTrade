import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

export const matchRouter = Router();

matchRouter.get("/discover", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de implementar discovery de matches." });
});

matchRouter.post("/", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de crear match." });
});

matchRouter.patch("/:matchId/status", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de actualizar estado del match." });
});
