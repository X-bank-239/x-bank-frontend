/** Базовый URL API по умолчанию. */
export const DEFAULT_API_BASE_URL = "https://4c5450410f2f.vps.myjino.ru/api";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** База для fetch: только абсолютный URL из env или дефолт. */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) return normalizeBaseUrl(DEFAULT_API_BASE_URL);
  if (raw.startsWith("/")) {
    return normalizeBaseUrl(DEFAULT_API_BASE_URL);
  }
  return normalizeBaseUrl(raw);
}
