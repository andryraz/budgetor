import { Router } from "express";

import { getPrismaClient } from "@/configs";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const startTime = Date.now();

  try {
    await getPrismaClient().$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: "connected",
      responseTime: `${Date.now() - startTime}ms`,
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: "disconnected",
      error: err.message,
    });
  }
});