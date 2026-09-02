import type { Request, Response } from "express";
import { app } from "../server/app";

/**
 * Entrada catch-all da Vercel para a API Express/tRPC.
 * A função não chama app.listen(): a Vercel fornece o servidor HTTP.
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
