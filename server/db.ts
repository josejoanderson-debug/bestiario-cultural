import { getSupabaseAdmin } from "./supabase";
import { culturalEntries, type CulturalCategory, type CulturalEntry, type CulturalExtraPage, type CulturalSource } from "../shared/culturalData";

const categoryLabels: Record<CulturalCategory, string> = {
  musica: "Música",
  danca: "Dança",
  artesanato: "Artesanato",
  festa: "Festa",
};

export type CulturalChapterInput = {
  slug?: string;
  title: string;
  subtitle: string;
  category: CulturalCategory;
  region: string;
  territorialNote: string;
  excerpt: string;
  story: string[];
  visualMotif: string;
  sources: CulturalSource[];
  photoUrl: string;
  photoCredit: string;
  photoSourceUrl: string;
  photoLicense: string;
  extraPages: CulturalExtraPage[];
  isPublished: boolean;
};

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96);
}

function normalizeSource(source: CulturalSource): CulturalSource {
  return {
    title: source.title.trim(),
    institution: source.institution.trim(),
    url: source.url.trim(),
    note: source.note.trim(),
  };
}

export function mapCulturalEntries(
  chapters: any[],
  sources: any[],
  extraPages: any[],
  extraImages: any[],
): CulturalEntry[] {
  return chapters.map((chapter) => ({
    number: chapter.chapterNumber,
    photoUrl: chapter.photoUrl ?? "",
    photoCredit: chapter.photoCredit ?? "",
    photoSourceUrl: chapter.photoSourceUrl ?? "",
    photoLicense: chapter.photoLicense ?? "",
    extraPages: extraPages
      .filter((page) => page.chapterSlug === chapter.slug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((page) => ({
        id: page.id,
        eyebrow: page.eyebrow,
        title: page.title,
        content: page.content,
        images: extraImages
          .filter((image) => image.pageId === page.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            altText: image.altText,
            credit: image.credit,
            sourceUrl: image.sourceUrl,
            license: image.license,
          })),
      })),
    slug: chapter.slug,
    title: chapter.title,
    subtitle: chapter.subtitle,
    category: chapter.category,
    categoryLabel: categoryLabels[chapter.category as CulturalCategory],
    region: chapter.territory,
    territorialNote: chapter.territorialNote,
    excerpt: chapter.excerpt,
    story: String(chapter.content ?? "").split(/\n\n+/).map((paragraph) => paragraph.trim()).filter(Boolean),
    visualMotif: String(chapter.illustrationLabel ?? "").replace(/^Ilustração artística\s*[—–-]\s*/i, ""),
    isPublished: chapter.isPublished,
    sources: sources
      .filter((source) => source.chapterSlug === chapter.slug)
      .map((source) => ({
        title: source.title,
        institution: source.institution,
        url: source.sourceUrl,
        note: source.note,
      })),
  }));
}

export function publicCulturalEntries(entries: CulturalEntry[]): CulturalEntry[] {
  return entries.filter((entry) => entry.isPublished !== false).map(({ isPublished, ...entry }) => entry);
}

async function queryAcervo(includeUnpublished: boolean) {
  const supabase = getSupabaseAdmin();
  let chapterQuery = supabase.from("cultural_chapters").select("*").order("chapter_number", { ascending: true });
  if (!includeUnpublished) chapterQuery = chapterQuery.eq("is_published", true);
  const { data: chapters, error: chapterError } = await chapterQuery;
  if (chapterError) throw new Error(`Falha ao consultar culturas no Supabase: ${chapterError.message}`);
  if (!chapters?.length) return [] as CulturalEntry[];

  const slugs = chapters.map((chapter) => chapter.slug);
  const [sourceResult, pageResult] = await Promise.all([
    supabase.from("cultural_sources").select("*").in("chapter_slug", slugs),
    supabase.from("cultural_extra_pages").select("*").in("chapter_slug", slugs).order("sort_order", { ascending: true }),
  ]);
  if (sourceResult.error) throw new Error(`Falha ao consultar fontes: ${sourceResult.error.message}`);
  if (pageResult.error) throw new Error(`Falha ao consultar páginas extras: ${pageResult.error.message}`);

  const pages = pageResult.data ?? [];
  const pageIds = pages.map((page) => page.id);
  const imageResult = pageIds.length
    ? await supabase.from("cultural_extra_page_images").select("*").in("page_id", pageIds).order("sort_order", { ascending: true })
    : { data: [], error: null };
  if (imageResult.error) throw new Error(`Falha ao consultar imagens: ${imageResult.error.message}`);

  const entries = mapCulturalEntries(chapters, sourceResult.data ?? [], pages, imageResult.data ?? []);
  return includeUnpublished ? entries : publicCulturalEntries(entries);
}

export async function listCulturalEntries(options?: { includeUnpublished?: boolean }): Promise<CulturalEntry[]> {
  const includeUnpublished = options?.includeUnpublished ?? false;
  try {
    return await queryAcervo(includeUnpublished);
  } catch (error) {
    console.warn("[Supabase] Acervo remoto indisponível; usando catálogo local:", error);
    return includeUnpublished ? culturalEntries : publicCulturalEntries(culturalEntries);
  }
}

export async function getCulturalEntryBySlug(slug: string, includeUnpublished = false) {
  const entries = await listCulturalEntries({ includeUnpublished });
  return entries.find((entry) => entry.slug === slug) ?? null;
}

async function replaceSources(chapterSlug: string, sources: CulturalSource[]) {
  const supabase = getSupabaseAdmin();
  const { error: deleteError } = await supabase.from("cultural_sources").delete().eq("chapter_slug", chapterSlug);
  if (deleteError) throw new Error(`Falha ao limpar fontes: ${deleteError.message}`);
  if (!sources.length) return;
  const rows = sources.map((source) => {
    const item = normalizeSource(source);
    return { chapter_slug: chapterSlug, title: item.title, institution: item.institution, source_url: item.url, note: item.note };
  });
  const { error } = await supabase.from("cultural_sources").insert(rows);
  if (error) throw new Error(`Falha ao salvar fontes: ${error.message}`);
}

async function replaceExtraPages(chapterSlug: string, pages: CulturalExtraPage[]) {
  const supabase = getSupabaseAdmin();
  const { data: previousPages, error: previousError } = await supabase.from("cultural_extra_pages").select("id").eq("chapter_slug", chapterSlug);
  if (previousError) throw new Error(`Falha ao consultar páginas antigas: ${previousError.message}`);
  const previousIds = (previousPages ?? []).map((page) => page.id);
  if (previousIds.length) {
    const { error: imageDeleteError } = await supabase.from("cultural_extra_page_images").delete().in("page_id", previousIds);
    if (imageDeleteError) throw new Error(`Falha ao remover imagens antigas: ${imageDeleteError.message}`);
  }
  const { error: pageDeleteError } = await supabase.from("cultural_extra_pages").delete().eq("chapter_slug", chapterSlug);
  if (pageDeleteError) throw new Error(`Falha ao remover páginas antigas: ${pageDeleteError.message}`);

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const page = pages[pageIndex];
    const { data: created, error: pageError } = await supabase.from("cultural_extra_pages").insert({
      chapter_slug: chapterSlug,
      sort_order: pageIndex,
      eyebrow: page.eyebrow.trim(),
      title: page.title.trim(),
      content: page.content.trim(),
    }).select("id").single();
    if (pageError || !created) throw new Error(`Falha ao salvar página extra: ${pageError?.message ?? "registro não retornado"}`);

    const imageRows = page.images.map((image, imageIndex) => ({
      page_id: created.id,
      sort_order: imageIndex,
      image_url: image.imageUrl.trim(),
      alt_text: image.altText.trim(),
      credit: image.credit.trim(),
      source_url: image.sourceUrl.trim(),
      license: image.license.trim(),
    }));
    if (imageRows.length) {
      const { error: imageError } = await supabase.from("cultural_extra_page_images").insert(imageRows);
      if (imageError) throw new Error(`Falha ao salvar imagens da página: ${imageError.message}`);
    }
  }
}

async function nextChapterNumber() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("cultural_chapters").select("chapter_number").order("chapter_number", { ascending: false }).limit(1);
  if (error) throw new Error(`Falha ao obter numeração do acervo: ${error.message}`);
  return (data?.[0]?.chapter_number ?? 0) + 1;
}

export async function createCulturalEntry(input: CulturalChapterInput) {
  const supabase = getSupabaseAdmin();
  const slug = toSlug(input.slug || input.title);
  if (!slug) throw new Error("Não foi possível gerar o identificador da cultura.");
  const { data: existing, error: existingError } = await supabase.from("cultural_chapters").select("slug").eq("slug", slug).limit(1);
  if (existingError) throw new Error(`Falha ao verificar cultura: ${existingError.message}`);
  if (existing?.length) throw new Error("Já existe uma cultura com este identificador.");

  const { error } = await supabase.from("cultural_chapters").insert({
    chapter_number: await nextChapterNumber(),
    photo_url: input.photoUrl.trim(),
    photo_credit: input.photoCredit.trim(),
    photo_source_url: input.photoSourceUrl.trim(),
    photo_license: input.photoLicense.trim(),
    slug,
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    category: input.category,
    territory: input.region.trim(),
    territorial_note: input.territorialNote.trim(),
    excerpt: input.excerpt.trim(),
    content: input.story.map((paragraph) => paragraph.trim()).filter(Boolean).join("\n\n"),
    illustration_label: `Ilustração artística — ${input.visualMotif.trim()}`,
    is_published: input.isPublished,
  });
  if (error) throw new Error(`Falha ao salvar cultura: ${error.message}`);
  await replaceSources(slug, input.sources);
  await replaceExtraPages(slug, input.extraPages);
  return getCulturalEntryBySlug(slug, true);
}

export async function updateCulturalEntry(originalSlug: string, input: CulturalChapterInput) {
  const supabase = getSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase.from("cultural_chapters").select("*").eq("slug", originalSlug).limit(1);
  if (existingError) throw new Error(`Falha ao localizar cultura: ${existingError.message}`);
  if (!existing?.length) return null;

  const slug = toSlug(input.slug || input.title);
  if (!slug) throw new Error("Não foi possível gerar o identificador da cultura.");
  if (slug !== originalSlug) {
    const { data: duplicate, error: duplicateError } = await supabase.from("cultural_chapters").select("slug").eq("slug", slug).limit(1);
    if (duplicateError) throw new Error(`Falha ao verificar novo identificador: ${duplicateError.message}`);
    if (duplicate?.length) throw new Error("Já existe uma cultura com este identificador.");
  }

  const { error } = await supabase.from("cultural_chapters").update({
    slug,
    photo_url: input.photoUrl.trim(),
    photo_credit: input.photoCredit.trim(),
    photo_source_url: input.photoSourceUrl.trim(),
    photo_license: input.photoLicense.trim(),
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    category: input.category,
    territory: input.region.trim(),
    territorial_note: input.territorialNote.trim(),
    excerpt: input.excerpt.trim(),
    content: input.story.map((paragraph) => paragraph.trim()).filter(Boolean).join("\n\n"),
    illustration_label: `Ilustração artística — ${input.visualMotif.trim()}`,
    is_published: input.isPublished,
  }).eq("slug", originalSlug);
  if (error) throw new Error(`Falha ao atualizar cultura: ${error.message}`);

  if (slug !== originalSlug) {
    const { error: sourceMoveError } = await supabase.from("cultural_sources").update({ chapter_slug: slug }).eq("chapter_slug", originalSlug);
    if (sourceMoveError) throw new Error(`Falha ao mover fontes: ${sourceMoveError.message}`);
    const { error: pageMoveError } = await supabase.from("cultural_extra_pages").update({ chapter_slug: slug }).eq("chapter_slug", originalSlug);
    if (pageMoveError) throw new Error(`Falha ao mover páginas: ${pageMoveError.message}`);
  }
  await replaceSources(slug, input.sources);
  await replaceExtraPages(slug, input.extraPages);
  return getCulturalEntryBySlug(slug, true);
}

export async function setCulturalEntryPublication(slug: string, isPublished: boolean) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("cultural_chapters").update({ is_published: isPublished }).eq("slug", slug).select("slug").single();
  if (error) throw new Error(`Falha ao atualizar publicação: ${error.message}`);
  return data;
}
