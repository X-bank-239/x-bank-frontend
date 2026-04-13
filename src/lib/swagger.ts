function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const DEFAULT_API_BASE_URL = "https://4c5450410f2f.vps.myjino.ru/api";

const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
);

/**
 * Ссылки на документацию API (можно переопределить через env).
 */
export const SWAGGER_UI_URL =
  process.env.NEXT_PUBLIC_SWAGGER_UI_URL ?? `${API_BASE_URL}/swagger-ui/index.html`;

export const OPENAPI_SPEC_URL =
  process.env.NEXT_PUBLIC_OPENAPI_SPEC_URL ?? `${API_BASE_URL}/v3/api-docs`;


