import { apiClient } from "./client";
import type {
  CreateCurrencyRateRequest,
  Currency,
  CurrencyRate,
  UpdateCurrencyRateRequest,
} from "@/types";

export const cbrApi = {
  getSupportedCurrencies(): Promise<Currency[]> {
    // OpenAPI: GET /currency-rates/supported
    return apiClient.get<Currency[]>("/currency-rates/supported");
  },

  getLatestRates(): Promise<CurrencyRate[]> {
    // OpenAPI: GET /currency-rates/latest
    return apiClient.get<CurrencyRate[]>("/currency-rates/latest");
  },

  getLatestRateForCurrency(currency: string): Promise<CurrencyRate> {
    const enc = encodeURIComponent(currency);
    // OpenAPI: GET /currency-rates/latest/{currency}
    return apiClient.get<CurrencyRate>(`/currency-rates/latest/${enc}`);
  },

  getRatesByDate(date: string): Promise<CurrencyRate[]> {
    // OpenAPI: GET /currency-rates/date/{date}
    const enc = encodeURIComponent(date);
    return apiClient.get<CurrencyRate[]>(`/currency-rates/date/${enc}`);
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
