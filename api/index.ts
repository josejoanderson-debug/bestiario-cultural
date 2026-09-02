import type { Request, Response } from "express";
import { app } from "../server/app";

/**
 * Entrada da Vercel Serverless Function.
 * A aplicação Express atende o tRPC em /api/trpc.
 * A função não chama app.listen(): a Vercel fornece o servidor HTTP.
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
