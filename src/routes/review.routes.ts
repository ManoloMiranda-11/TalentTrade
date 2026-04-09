import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";

export const reviewRouter = Router();

reviewRouter.post("/", requireAuth, (_req, res) => {
  res.status(501).json({ message: "Pendiente de crear review." });
});
