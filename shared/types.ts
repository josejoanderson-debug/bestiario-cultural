/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type User = { id: string; name: string | null; email: string | null; role: "user" | "admin" };
export * from "./_core/errors";
