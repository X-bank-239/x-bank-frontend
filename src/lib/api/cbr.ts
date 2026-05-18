import { apiClient } from "./client";
import type {
  CreateCurrencyRateRequest,
  Currency,
  CurrencyRate,
  UpdateCurrencyRateRequest,
} from "@/types";

/** Бэкенд может вернуть null для валют без курса (например RUB в /latest). */
function normalizeCurrencyRates(data: unknown): CurrencyRate[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is CurrencyRate =>
      item != null &&
      typeof item === "object" &&
      typeof (item as CurrencyRate).currency === "string" &&
      typeof (item as CurrencyRate).rate === "number"
  );
}

export const cbrApi = {
  getSupportedCurrencies(): Promise<Currency[]> {
    // OpenAPI: GET /currency-rates/supported
    return apiClient.get<Currency[]>("/currency-rates/supported");
  },

  async getLatestRates(): Promise<CurrencyRate[]> {
    // OpenAPI: GET /currency-rates/latest
    const data = await apiClient.get<unknown>("/currency-rates/latest");
    return normalizeCurrencyRates(data);
  },

  getLatestRateForCurrency(currency: string): Promise<CurrencyRate> {
    const enc = encodeURIComponent(currency);
    // OpenAPI: GET /currency-rates/latest/{currency}
    return apiClient.get<CurrencyRate>(`/currency-rates/latest/${enc}`);
  },

  async getRatesByDate(date: string): Promise<CurrencyRate[]> {
    // OpenAPI: GET /currency-rates/date/{date}
    const enc = encodeURIComponent(date);
    const data = await apiClient.get<unknown>(`/currency-rates/date/${enc}`);
    return normalizeCurrencyRates(data);
  },

  syncFromCbr(date: string): Promise<void> {
    // OpenAPI: POST /currency-rates/sync-from-cbr?date=
    const query = new URLSearchParams({ date }).toString();
    return apiClient.post<void>(`/currency-rates/sync-from-cbr?${query}`);
  },

  createRate(data: CreateCurrencyRateRequest): Promise<CurrencyRate> {
    // OpenAPI: POST /currency-rates
    return apiClient.post<CurrencyRate>("/currency-rates", data);
  },

  updateRate(
    currency: Currency,
    date: string,
    data: UpdateCurrencyRateRequest
  ): Promise<CurrencyRate> {
    // OpenAPI: PATCH /currency-rates?currency=&date=
    const query = new URLSearchParams({ currency, date }).toString();
    return apiClient.patch<CurrencyRate>(`/currency-rates?${query}`, data);
  },

  deleteRatesByDate(date: string): Promise<void> {
    // OpenAPI: DELETE /currency-rates?date=
    const query = new URLSearchParams({ date }).toString();
    return apiClient.delete<void>(`/currency-rates?${query}`);
  },
};
