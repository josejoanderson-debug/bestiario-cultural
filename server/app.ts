import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

/**
 * Express compartilhado entre o desenvolvimento local e as Vercel Functions.
 * A aplicação não chama app.listen() quando é carregada pela Vercel.
 */
export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  // O limite fica abaixo do limite de payload das Functions da Vercel.
  // O painel restringe a imagem a 2,5 MB antes da codificação base64.
  app.use(express.json({ limit: "4mb" }));
  app.use(express.urlencoded({ limit: "4mb", extended: true }));

  const trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext,
  });

  // A Vercel pode entregar a URL completa ou removê-la ao entrar no catch-all.
  // Os dois mounts deixam `/api/trpc` resiliente nos dois cenários.
  app.use(["/api/trpc", "/trpc"], trpcMiddleware);

  app.get(["/api/health", "/health"], (_req, res) => {
    res.status(200).json({ ok: true, service: "bestiario-cultural-api" });
  });

  return app;
}

export const app = createApp();
