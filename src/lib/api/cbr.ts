import { apiClient } from "./client";
import type { Currency, CurrencyRate } from "@/types";

export const cbrApi = {
  getSupportedCurrencies(): Promise<Currency[]> {
    return apiClient.get<Currency[]>("/cbr/supported");
  },

  getLatestRates(): Promise<CurrencyRate[]> {
    return apiClient.get<CurrencyRate[]>("/cbr/rates/get-latest");
  },

  getLatestRateForCurrency(currency: string): Promise<CurrencyRate> {
    const enc = encodeURIComponent(currency);
    return apiClient.get<CurrencyRate>(`/cbr/rates/get-latest/${enc}`);
  },
};
