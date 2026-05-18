"use client";

import { useEffect, useState } from "react";
import { fetchLoanFullDebtAmount } from "@/lib/loan-debt";
import type { LoanResponse } from "@/types";

/** Сумма полного погашения (тело + проценты) для активного кредита. */
export function useLoanFullDebt(loan: LoanResponse | null): number | null {
  const [fullDebt, setFullDebt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFullDebt(null);
    if (!loan || loan.status !== "ACTIVE") return;

    void fetchLoanFullDebtAmount(loan).then((amount) => {
      if (!cancelled) setFullDebt(amount);
    });

    return () => {
      cancelled = true;
    };
  }, [
    loan?.loanId,
    loan?.status,
    loan?.outstandingPrincipal,
    loan?.nextPaymentDate,
  ]);

  return fullDebt;
}
