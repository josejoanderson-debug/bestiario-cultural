import type { Request, Response } from "express";
import { app } from "../server/app.ts";

/**
 * Vercel Serverless Function entry point.
 * Express mounts the tRPC router at /api/trpc.
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}