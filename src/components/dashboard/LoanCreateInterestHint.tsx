"use client";

import { useEffect, useState } from "react";
import { loansApi } from "@/lib/api";
import { formatLoanInterestRateText } from "@/lib/utils";

/** Ставка по кредиту до оформления (GET /loans/rate). */
export function LoanCreateInterestHint() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void loansApi
      .getRate()
      .then((value) => {
        if (!cancelled) setRate(value);
      })
      .catch(() => {
        if (!cancelled) setRate(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Загрузка ставки по кредиту…</p>
    );
  }

  if (rate === null) return null;

  return (
    <p className="text-sm text-slate-600 dark:text-slate-300">
      <span className="font-semibold text-slate-800 dark:text-slate-100">
        {formatLoanInterestRateText(rate)}
      </span>
    </p>
  );
}
