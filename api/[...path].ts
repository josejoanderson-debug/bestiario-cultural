import type { Request, Response } from "express";
import { app } from "../server/app.ts";

/**
 * Catch-all Vercel Function for the Express/tRPC API.
 * This preserves the original /api/trpc/... request path.
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}