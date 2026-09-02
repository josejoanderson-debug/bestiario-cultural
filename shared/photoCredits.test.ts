import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { culturalEntries } from "./culturalData";
import { photoLedger } from "./photoLedger";

describe("registro fotográfico documental", () => {
  const ledger = readFileSync(
    new URL("../photo_credits.md", import.meta.url),
    "utf8"
  );
  const rows = ledger
    .split("\n")
    .filter(line => line.startsWith("| ") && !line.startsWith("| ---"));

  it("mantém imagem, crédito e URL únicos para cada capítulo publicado", () => {
    expect(rows).toHaveLength(culturalEntries.length + 1);
    for (const entry of culturalEntries) {
      const photo = entry.photoUrl
        ? {
            image: entry.photoUrl,
            label: entry.photoCredit,
            url: entry.photoSourceUrl,
          }
        : photoLedger[entry.slug];

      expect(rows.some(row => row.includes(`| ${entry.title} |`))).toBe(true);
      expect(photo?.image).toMatch(/^https:\/\//);
      expect(photo?.label).toBeTruthy();
      expect(photo?.url).toMatch(/^https:\/\//);
      expect(ledger).toContain(photo?.url);
    }
  });

  it("não aceita páginas de categoria como origem da fotografia", () => {
    for (const row of rows.slice(1)) {
      expect(row).toContain("https://");
      expect(row).not.toContain("/Category:");
      expect(row).not.toContain("licença a confirmar");
    }
  });

  it("sinaliza explicitamente a exceção curatorial do Pastoril", () => {
    expect(photoLedger.pastoril.kind).toBe("contextual-reference");
    expect(ledger).toContain(
      "não como registro da apresentação específica de Pastoril"
    );
  });
});
