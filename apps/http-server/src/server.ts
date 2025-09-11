import express from "express";
import type { Express, Request, Response } from "express";
import { authRouter } from "@/routers/auth-routes";
import { authMiddleware } from "@/middlewares/auth-middleware";

const app: Express = express();

app.use(express.json());

app.use("/auth", authRouter);

app.get("/health", authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server health is ok.",
    environment: process.env.NODE_ENV || "unknown",
  });
});

export default app;
