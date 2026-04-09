import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

export const skillRouter = Router();

skillRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "Pendiente de listar habilidades." });
});

skillRouter.post("/me", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de asignar habilidades al usuario." });
});
