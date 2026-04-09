import { Router } from "express";

import { authRouter } from "./auth.routes.js";
import { matchRouter } from "./match.routes.js";
import { messageRouter } from "./message.routes.js";
import { reviewRouter } from "./review.routes.js";
import { sessionRouter } from "./session.routes.js";
import { skillRouter } from "./skill.routes.js";
import { userRouter } from "./user.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/skills", skillRouter);
apiRouter.use("/matches", matchRouter);
apiRouter.use("/messages", messageRouter);
apiRouter.use("/sessions", sessionRouter);
apiRouter.use("/reviews", reviewRouter);
