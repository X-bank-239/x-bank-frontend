import { apiClient } from "./client";
import type {
  CreateLoanRequest,
  LoanRepaymentRequest,
  LoanPaymentAmountResponse,
  LoanResponse,
} from "@/types";

export const loansApi = {
  /** GET /loans/rate — годовая ставка до оформления кредита. */
  getRate(): Promise<number> {
    return apiClient.get<number>("/loans/rate");
  },

  list(): Promise<LoanResponse[]> {
    return apiClient.get<LoanResponse[]>("/loans/list");
  },

  create(data: CreateLoanRequest): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>("/loans/create", data);
  },

  getByLoanId(loanId: string): Promise<LoanResponse> {
    return apiClient.get<LoanResponse>(`/loans/${loanId}`);
  },

  /** GET /loans/accounts/{accountId} — кредит по дебетовому счёту. */
  get(accountId: string): Promise<LoanResponse> {
    return apiClient.get<LoanResponse>(`/loans/accounts/${accountId}`);
  },

  repayMonthlyByLoan(loanId: string, data: LoanRepaymentRequest): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/${loanId}/repay/monthly`, data);
  },

  repayEarlyByLoan(loanId: string, data: LoanRepaymentRequest): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/${loanId}/repay/early`, data);
  },

  monthlyPaymentCostByLoan(loanId: string): Promise<LoanPaymentAmountResponse> {
    return apiClient.post<LoanPaymentAmountResponse>(
      `/loans/${loanId}/payment-cost/monthly`
    );
  },

  fullPaymentCostByLoan(loanId: string): Promise<LoanPaymentAmountResponse> {
    return apiClient.post<LoanPaymentAmountResponse>(
      `/loans/${loanId}/payment-cost/early`
    );
  },

  getAutopayStatusByLoan(loanId: string): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/${loanId}/autopay/status`);
  },

  enableAutopayByLoan(loanId: string): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/${loanId}/autopay/enable`);
  },

  disableAutopayByLoan(loanId: string): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/${loanId}/autopay/disable`);
  },

  repayMonthly(accountId: string, data: LoanRepaymentRequest): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/accounts/${accountId}/repay/monthly`, data);
  },

  repayEarly(accountId: string, data: LoanRepaymentRequest): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/accounts/${accountId}/repay/early`, data);
  },

  monthlyPaymentCost(accountId: string): Promise<LoanPaymentAmountResponse> {
    return apiClient.post<LoanPaymentAmountResponse>(
      `/loans/accounts/${accountId}/payment-cost/monthly`
    );
  },

  fullPaymentCost(accountId: string): Promise<LoanPaymentAmountResponse> {
    return apiClient.post<LoanPaymentAmountResponse>(
      `/loans/accounts/${accountId}/payment-cost/early`
    );
  },

  getAutopayStatusByAccount(accountId: string): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/accounts/${accountId}/autopay/status`);
  },

  enableAutopayByAccount(accountId: string): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/accounts/${accountId}/autopay/enable`);
  },

  disableAutopayByAccount(accountId: string): Promise<LoanResponse> {
    return apiClient.post<LoanResponse>(`/loans/accounts/${accountId}/autopay/disable`);
  },
};
