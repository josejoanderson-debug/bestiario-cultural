import { getSupabaseAdmin } from "./supabase";

type StorageResult = { key: string; url: string };
const BUCKET = "cultural-images";

function normalizeKey(value: string) {
  return value.replace(/^\/+/, "").replace(/[^a-zA-Z0-9._\/-]+/g, "-");
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream"): Promise<StorageResult> {
  const supabase = getSupabaseAdmin();
  const key = normalizeKey(relKey);
  const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  const { error } = await supabase.storage.from(BUCKET).upload(key, body, {
    contentType,
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`Falha ao enviar imagem para o Supabase Storage: ${error.message}`);
  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(key);
  if (!publicData.publicUrl) throw new Error("Supabase não retornou a URL pública da imagem.");
  return { key, url: publicData.publicUrl };
}

export async function storageGet(relKey: string): Promise<StorageResult> {
  const supabase = getSupabaseAdmin();
  const key = normalizeKey(relKey);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  return (await storageGet(relKey)).url;
}
