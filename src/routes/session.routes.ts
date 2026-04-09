import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

export const sessionRouter = Router();

sessionRouter.post("/", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de crear sesion." });
});

sessionRouter.get("/me", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de listar sesiones del usuario." });
});
