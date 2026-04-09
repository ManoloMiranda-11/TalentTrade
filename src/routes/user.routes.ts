import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de implementar perfil actual." });
});

userRouter.patch("/me", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de implementar edicion de perfil." });
});
