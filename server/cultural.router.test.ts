import { describe, expect, it } from "vitest";
import { culturalEntries } from "../shared/culturalData";
import { appRouter } from "./routers";

describe("procedimentos públicos cultural", () => {
  const caller = appRouter.createCaller({} as never);

  it("disponibiliza a lista editorial completa sem exigir autenticação", async () => {
    const entries = await caller.cultural.list();

    expect(entries).toHaveLength(culturalEntries.length);
    const expectedPublicEntries = culturalEntries.map(({ isPublished: _isPublished, ...entry }) => entry);
    expect(entries).toEqual(expectedPublicEntries);
  });

  it("recupera um capítulo pelo identificador e responde nulo para capítulo inexistente", async () => {
    const found = await caller.cultural.bySlug({ slug: "renda-renascenca" });
    const missing = await caller.cultural.bySlug({ slug: "capitulo-ausente" });

    expect(found?.title).toBe("Renda Renascença");
    expect(missing).toBeNull();
  });
});
