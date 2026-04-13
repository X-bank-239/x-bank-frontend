import { apiClient } from "./client";
import type {
  CreateLoanRequest,
  LoanRepaymentRequest,
  LoanPaymentAmountResponse,
  LoanResponse,
} from "@/types";

export const loansApi = {
  list(): Promise<LoanResponse[]> {
    return apiClient.get<LoanResponse[]>("/loans/list");
  },

  create(data: CreateLoanRequest): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>("/loans/create", data);
  },

  getByCreditAccount(creditAccountId: string): Promise<LoanResponse> {
    return apiClient.get<LoanResponse>(
      `/loans/get-by-credit-account/${creditAccountId}`
    );
  },

  // Совместимость с текущими экранами: `get(id)` трактуем как creditAccountId.
  get(creditAccountId: string): Promise<LoanResponse> {
    return this.getByCreditAccount(creditAccountId);
  },

  repayMonthly(
    creditAccountId: string,
    data: LoanRepaymentRequest
  ): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(
      `/loans/credit-accounts/${creditAccountId}/repay/monthly`,
      { amount: data.amount }
    );
  },

  repayEarly(
    creditAccountId: string,
    data: LoanRepaymentRequest
  ): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(
      `/loans/credit-accounts/${creditAccountId}/repay/early`,
      { amount: data.amount }
    );
  },

  monthlyPaymentCost(
    creditAccountId: string,
    data: LoanRepaymentRequest
  ): Promise<LoanPaymentAmountResponse> {
    return apiClient.post<LoanPaymentAmountResponse>(
      `/loans/credit-accounts/${creditAccountId}/payment-cost/monthly`,
      { amount: data.amount }
    );
  },

  fullPaymentCost(creditAccountId: string): Promise<LoanPaymentAmountResponse> {
    return apiClient.post<LoanPaymentAmountResponse>(
      `/loans/credit-accounts/${creditAccountId}/payment-cost/early`
    );
  },
};
