import { loansApi } from "@/lib/api";
import type { Currency, LoanResponse } from "@/types";

/** Сумма полного досрочного погашения (тело + проценты) для активного кредита. */
export async function fetchLoanFullDebtAmount(
  loan: LoanResponse
): Promise<number | null> {
  if (loan.status !== "ACTIVE") return null;
  try {
    const cost = await loansApi.fullPaymentCostByLoan(loan.loanId);
    return cost.amount;
  } catch {
    return null;
  }
}

/** Общий долг по активным кредитам, сгруппированный по валюте. */
export async function fetchActiveLoansFullDebtByCurrency(
  loans: LoanResponse[]
): Promise<Map<Currency, number>> {
  const map = new Map<Currency, number>();
  const active = loans.filter((l) => l.status === "ACTIVE");
  const amounts = await Promise.all(
    active.map(async (loan) => ({
      currency: loan.currency,
      amount: await fetchLoanFullDebtAmount(loan),
    }))
  );
  for (const { currency, amount } of amounts) {
    if (amount == null) continue;
    map.set(currency, (map.get(currency) ?? 0) + amount);
  }
  return map;
}

/** Полный долг по loanId для отображения в списках. */
export async function fetchLoansFullDebtByLoanId(
  loans: LoanResponse[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const active = loans.filter((l) => l.status === "ACTIVE");
  const entries = await Promise.all(
    active.map(async (loan) => [loan.loanId, await fetchLoanFullDebtAmount(loan)] as const)
  );
  for (const [loanId, amount] of entries) {
    if (amount != null) map.set(loanId, amount);
  }
  return map;
}
