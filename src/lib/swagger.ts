import { getApiBaseUrl } from "@/lib/api-base-url";

const API_BASE_URL = getApiBaseUrl();

/**
 * Ссылки на документацию API (можно переопределить через env).
 */
export const SWAGGER_UI_URL =
  process.env.NEXT_PUBLIC_SWAGGER_UI_URL ?? `${API_BASE_URL}/swagger-ui/index.html`;

export const OPENAPI_SPEC_URL =
  process.env.NEXT_PUBLIC_OPENAPI_SPEC_URL ?? `${API_BASE_URL}/v3/api-docs`;
