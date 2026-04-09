import { Router } from "express";

export const authRouter = Router();

authRouter.post("/register", (_req, res) => {
  res.status(501).json({ message: "Pendiente de implementar registro." });
});

authRouter.post("/login", (_req, res) => {
  res.status(501).json({ message: "Pendiente de implementar login." });
});
