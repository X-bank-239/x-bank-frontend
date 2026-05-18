import { apiClient } from "./client";
import { normalizeSavingsInterestRatePercent } from "@/lib/utils";
import type {
  CloseSavingsRequest,
  CreateSavingsAccountRequest,
  ProlongSavingsRequest,
  SavingsAccount,
} from "@/types";

/**
 * Вклады — пути как в OpenAPI.
 * create / prolong / close: JSON-тело; list/get: нормализация camelCase и snake_case.
 */
export interface SavingsInterestParams {
  allowWithdrawal: boolean;
  allowTopUp: boolean;
}

function pick<T>(raw: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null) return value as T;
  }
  return undefined;
}

/** Ответ бэкенда может быть camelCase или snake_case. */
export function normalizeSavingsAccount(data: unknown): SavingsAccount {
  const raw = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const interestRaw = pick<number>(raw, "interestRate", "interest_rate") ?? 0;

  return {
    accountId: pick<string>(raw, "accountId", "account_id") ?? "",
    accruedInterest: pick<number>(raw, "accruedInterest", "accrued_interest") ?? 0,
    interestRate: normalizeSavingsInterestRatePercent(interestRaw),
    maturityDate: pick<string>(raw, "maturityDate", "maturity_date") ?? "",
    lastInterestCalculation:
      pick<string>(raw, "lastInterestCalculation", "last_interest_calculation") ?? "",
    allowWithdrawal: pick<boolean>(raw, "allowWithdrawal", "allow_withdrawal") ?? false,
    allowTopUp:
      pick<boolean>(raw, "allowTopUp", "allow_top_up", "allowTopup") ?? false,
    earlyWithdrawalPenalty:
      pick<number>(raw, "earlyWithdrawalPenalty", "early_withdrawal_penalty") ?? 0,
    status: pick<string>(raw, "status") ?? "",
    autoProlong: pick<boolean>(raw, "autoProlong", "auto_prolong") ?? false,
  };
}

function normalizeSavingsList(data: unknown): SavingsAccount[] {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeSavingsAccount);
}

export const savingsApi = {
  async getAll(): Promise<SavingsAccount[]> {
    const data = await apiClient.get<unknown>("/savings/list");
    return normalizeSavingsList(data);
  },

  async getInterest(params: SavingsInterestParams): Promise<number> {
    const q = new URLSearchParams({
      allowWithdrawal: String(params.allowWithdrawal),
      allowTopUp: String(params.allowTopUp),
    }).toString();
    const rate = await apiClient.get<number>(`/savings/interest?${q}`);
    return normalizeSavingsInterestRatePercent(rate);
  },

  async get(accountId: string): Promise<SavingsAccount> {
    const data = await apiClient.get<unknown>(`/savings/get/${accountId}`);
    return normalizeSavingsAccount(data);
  },

  /** POST /savings/create — тело JSON (`CreateSavingsAccountRequest`). */
  async create(data: CreateSavingsAccountRequest): Promise<SavingsAccount> {
    const created = await apiClient.post<unknown>("/savings/create", data);
    return normalizeSavingsAccount(created);
  },

  /** POST /savings/prolong/{accountId} — JSON-тело (`ProlongSavingsRequest`). */
  async prolong(accountId: string, data: ProlongSavingsRequest): Promise<SavingsAccount> {
    const updated = await apiClient.post<unknown>(`/savings/prolong/${accountId}`, {
      new_maturity_date: data.new_maturity_date,
    });
    return normalizeSavingsAccount(updated);
  },

  close(accountId: string, data: CloseSavingsRequest): Promise<void> {
    return apiClient.delete<void>(`/savings/close/${accountId}`, data);
  },
};
