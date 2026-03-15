import * as cors from "cors";
import * as express from "express";

import { errorHandler, securityHandler } from "@/middlewares";
import {  authRouter,
  configurationRouter,
  goalListRouter,
  goalRouter,
  labelRouter,
  projectRouter,
  subscriptionRouter,
  swaggerRouter,
  transactionListRouter,
  transactionRouter,
 healthRouter } from "@/routes";

import { walletRouter } from "./routes/wallet-routes";

export const server = async () => {
  try {
    const PORT = process.env.PORT || 8080;

    const app = express();
    app.use(express.json());

    // ── CORS ────────────────────────────────────────────────────────────────
    // "origin: true" reflète l'origine de la requête → accepte tout.
    // Suffisant pour dev local + ngrok + build mobile.
    // En production, remplacer true par "https://mondomaine.com"
    app.use(
      cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
      })
    );

    app.use("/auth", authRouter);
    app.use("/", healthRouter);

    app.use("/account/:accountId/wallet/:walletId/transaction", securityHandler, transactionRouter);
    app.use("/account/:accountId/transaction", securityHandler, transactionListRouter);
    app.use("/account/:accountId/label", securityHandler, labelRouter);
    app.use("/account/:accountId/wallet", securityHandler, walletRouter);
    app.use("/account/:accountId/wallet/:walletId/goal", securityHandler, goalRouter);
    app.use("/account/:accountId/goal", securityHandler, goalListRouter);
    app.use("/account/:accountId/project", securityHandler, projectRouter);
    app.use("/account/:accountId/configuration", securityHandler, configurationRouter);
    app.use("/account/:accountId/subscription", securityHandler, subscriptionRouter);
    app.use("/", swaggerRouter);

    app.use(errorHandler);

    // ── Listen sur 0.0.0.0 ──────────────────────────────────────────────────
    // "0.0.0.0" = toutes les interfaces réseau.
    // Sans ça, Express écoute sur 127.0.0.1 uniquement → ngrok et les
    // appareils sur le même WiFi ne peuvent pas atteindre le serveur.
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });

  } catch (err) {
    console.log(err);
  }
};