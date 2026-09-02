import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { culturalEntries } from "../shared/culturalData";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes da carga.");

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const imageQueries: Record<string, string> = {
  "bumba-meu-boi": "Bumba meu boi Maranhão",
  forro: "forró Brazil Luiz Gonzaga",
  "coco-de-roda": "coco de roda Paraíba",
  "quadrilha-junina": "quadrilha junina Brazil",
  maracatu: "maracatu Pernambuco",
  "cavalo-marinho": "cavalo marinho Pernambuco",
  "repente-cordel": "repente cantoria cordel Nordeste",
  "carnaval-de-rua": "carnaval de rua Brasil",
  fandango: "fandango caiçara Paraná",
  ciranda: "ciranda Pernambuco",
  pastoril: "pastoril Nordeste Brasil",
  reisado: "reisado Brasil",
  baiao: "Luiz Gonzaga baião",
  xaxado: "xaxado Pernambuco",
  cangaco: "cangaço Nordeste Brasil",
  "artesanato-de-barro": "cerâmica artesanal Nordeste Brasil",
  "renda-renascenca": "renda renascença Paraíba",
  "ceramica-de-caruaru": "cerâmica Caruaru Alto do Moura",
  lapinha: "lapinha Paraíba folguedo",
  "festa-de-sao-joao": "São João Campina Grande",
  capoeira: "capoeira Brazil",
  frevo: "frevo Pernambuco",
  "samba-de-roda": "samba de roda Recôncavo Bahia",
  jongo: "jongo Rio de Janeiro",
  "tambor-de-crioula": "tambor de crioula Maranhão",
  carimbo: "carimbó Pará",
  marabaixo: "marabaixo Amapá",
  "cirio-de-nazare": "Círio de Nazaré Belém Pará",
  congada: "congada Minas Gerais",
  cavalhadas: "Cavalhadas Pirenópolis Goiás",
  "siriri-cururu": "siriri cururu Mato Grosso",
};

async function findCommonsImage(query: string) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "5",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "1600",
    format: "json",
    origin: "*",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!response.ok) throw new Error(`Wikimedia respondeu HTTP ${response.status}`);
  const json = await response.json() as any;
  const pages = Object.values(json?.query?.pages ?? {}) as any[];
  const page = pages.find((item) => item.imageinfo?.[0]?.thumburl || item.imageinfo?.[0]?.url);
  if (!page) return null;
  const info = page.imageinfo[0];
  const metadata = info.extmetadata ?? {};
  return {
    url: info.thumburl ?? info.url,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(String(page.title).replace(/^File:/, "").replaceAll(" ", "_"))}`,
    credit: String(metadata.Artist?.value ?? metadata.Credit?.value ?? "Wikimedia Commons").replace(/<[^>]*>/g, "").trim().slice(0, 300),
    license: String(metadata.LicenseShortName?.value ?? "Ver licença na fonte").replace(/<[^>]*>/g, "").trim().slice(0, 200),
  };
}

for (const entry of culturalEntries) {
  let photo = entry.photoUrl && /^https:\/\//.test(entry.photoUrl)
    ? { url: entry.photoUrl, sourceUrl: entry.photoSourceUrl || entry.photoUrl, credit: entry.photoCredit || "Acervo Bestiário Cultural", license: entry.photoLicense || "Ver licença na fonte" }
    : null;

  if (!photo) {
    try {
      photo = await findCommonsImage(imageQueries[entry.slug] ?? entry.title);
    } catch (error) {
      console.warn(`Imagem não localizada para ${entry.title}:`, error);
    }
  }

  const payload = {
    chapter_number: entry.number,
    slug: entry.slug,
    title: entry.title,
    subtitle: entry.subtitle,
    category: entry.category,
    territory: entry.region,
    territorial_note: entry.territorialNote,
    excerpt: entry.excerpt,
    content: entry.story.join("\n\n"),
    illustration_label: `Ilustração artística — ${entry.visualMotif}`,
    photo_url: photo?.url ?? "",
    photo_credit: photo?.credit ?? "",
    photo_source_url: photo?.sourceUrl ?? "",
    photo_license: photo?.license ?? "",
    is_published: true,
  };

  const { data: chapter, error: chapterError } = await supabase
    .from("cultural_chapters")
    .upsert(payload, { onConflict: "slug" })
    .select("id, slug")
    .single();
  if (chapterError || !chapter) throw new Error(`${entry.title}: ${chapterError?.message ?? "capítulo não retornado"}`);

  await supabase.from("cultural_sources").delete().eq("chapter_slug", entry.slug);
  if (entry.sources.length) {
    const { error } = await supabase.from("cultural_sources").insert(entry.sources.map((item) => ({
      chapter_slug: entry.slug,
      title: item.title,
      institution: item.institution,
      source_url: item.url,
      note: item.note,
    })));
    if (error) throw new Error(`${entry.title}: fontes: ${error.message}`);
  }

  const { data: oldPages } = await supabase.from("cultural_extra_pages").select("id").eq("chapter_slug", entry.slug);
  const oldIds = (oldPages ?? []).map((page) => page.id);
  if (oldIds.length) await supabase.from("cultural_extra_page_images").delete().in("page_id", oldIds);
  await supabase.from("cultural_extra_pages").delete().eq("chapter_slug", entry.slug);

  for (const [pageIndex, page] of (entry.extraPages ?? []).entries()) {
    const { data: created, error: pageError } = await supabase.from("cultural_extra_pages").insert({
      chapter_slug: entry.slug,
      sort_order: pageIndex,
      eyebrow: page.eyebrow,
      title: page.title,
      content: page.content,
    }).select("id").single();
    if (pageError || !created) throw new Error(`${entry.title}: página extra: ${pageError?.message ?? "registro não retornado"}`);

    const images = page.images.map((item, imageIndex) => ({
      page_id: created.id,
      sort_order: imageIndex,
      image_url: item.imageUrl || photo?.url || "",
      alt_text: item.altText || `Registro de ${entry.title}`,
      credit: item.credit || photo?.credit || "Wikimedia Commons",
      source_url: item.sourceUrl || photo?.sourceUrl || "https://commons.wikimedia.org/",
      license: item.license || photo?.license || "Ver licença na fonte",
    })).filter((item) => item.image_url);
    if (images.length) {
      const { error } = await supabase.from("cultural_extra_page_images").insert(images);
      if (error) throw new Error(`${entry.title}: imagens extras: ${error.message}`);
    }
  }

  console.log(`✓ ${entry.number.toString().padStart(2, "0")} ${entry.title}`);
}

console.log(`\nAcervo sincronizado no Supabase: ${culturalEntries.length} culturas.`);
