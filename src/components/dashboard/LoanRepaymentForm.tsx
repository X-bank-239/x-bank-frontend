"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loansApi } from "@/lib/api";
import {
  assertLoanActiveForRepayment,
  findActiveLoanForDebitAccount,
  mapLoanRepaymentApiError,
} from "@/lib/loan-repayment";
import { useAuth } from "@/contexts/AuthContext";
import type { LoanResponse } from "@/types";
import { Button } from "@/components/ui";

interface LoanRepaymentFormProps {
  /** Дебетовый счёт, привязанный к кредиту (зачисление и погашение). */
  debitAccountId?: string;
  onRepaid?: (loan: LoanResponse) => void;
}

export function LoanRepaymentForm({ debitAccountId, onRepaid }: LoanRepaymentFormProps) {
  const { refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [repayMode, setRepayMode] = useState<"MONTHLY" | "EARLY">("MONTHLY");
  const [loanList, setLoanList] = useState<LoanResponse[] | null>(null);
  const [loanListLoading, setLoanListLoading] = useState(false);
  const [loanListError, setLoanListError] = useState(false);

  useEffect(() => {
    if (!debitAccountId) {
      setLoanList(null);
      setLoanListError(false);
      return;
    }
    let cancelled = false;
    setLoanListLoading(true);
    setLoanListError(false);
    void loansApi
      .list()
      .then((data) => {
        if (!cancelled) setLoanList(data);
      })
      .catch(() => {
        if (!cancelled) {
          setLoanList(null);
          setLoanListError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoanListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debitAccountId]);

  const activeLoanFromList =
    loanList && debitAccountId
      ? findActiveLoanForDebitAccount(loanList, debitAccountId)
      : undefined;
  const noActiveLoanKnown =
    Boolean(debitAccountId) &&
    loanList !== null &&
    !loanListError &&
    !activeLoanFromList;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Ошибка запроса";
      setError(mapLoanRepaymentApiError(raw));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {loanListLoading && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Проверка кредита…</p>
      )}
      {noActiveLoanKnown && (
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 text-sm">
          Нет активного кредита по этому счёту.{" "}
          <Link
            href="/dashboard/loans"
            className="font-medium text-primary-600 dark:text-primary-400 underline"
          >
            Оформить кредит
          </Link>
        </div>
      )}
      {(error || message) && (
        <div
          className={
            error
              ? "p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm"
              : "p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 text-sm"
          }
        >
          {error || message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Сумма
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={repayAmount}
          onChange={(e) => setRepayAmount(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
          placeholder="Сумма"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={
            busy ||
            !debitAccountId ||
            loanListLoading ||
            noActiveLoanKnown
          }
          onClick={() =>
            run(async () => {
              if (!debitAccountId) return;
              const data = await loansApi.get(debitAccountId);
              assertLoanActiveForRepayment(data);
              const amount = data.monthlyPayment;
              setRepayMode("MONTHLY");
              setRepayAmount(String(amount));
              setMessage("Подставлена сумма ежемесячного платежа.");
            })
          }
        >
          Ежемесячный
        </Button>
        <Button
          variant="outline"
          className="border-amber-200 text-amber-800 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950/40"
          disabled={
            busy ||
            !debitAccountId ||
            loanListLoading ||
            noActiveLoanKnown
          }
          onClick={() =>
            run(async () => {
              if (!debitAccountId) return;
              const loan = await loansApi.get(debitAccountId);
              assertLoanActiveForRepayment(loan);
              const cost = await loansApi.fullPaymentCost(debitAccountId);
              setRepayMode("EARLY");
              setRepayAmount(String(cost.amount));
              setMessage("Подставлена сумма полного досрочного погашения.");
            })
          }
        >
          Полное досрочное
        </Button>
        <Button
          disabled={
            busy ||
            !debitAccountId ||
            loanListLoading ||
            noActiveLoanKnown ||
            Number(repayAmount) <= 0
          }
          onClick={() =>
            run(async () => {
              if (!debitAccountId) return;
              const current = await loansApi.get(debitAccountId);
              assertLoanActiveForRepayment(current);
              const amount = Number(repayAmount);
              const updated =
                repayMode === "MONTHLY"
                  ? await loansApi.repayMonthly(debitAccountId, { amount })
                  : await loansApi.repayEarly(debitAccountId, { amount });
              setMessage(
                repayMode === "MONTHLY"
                  ? "Ежемесячный платёж выполнен."
                  : "Досрочное погашение выполнено."
              );
              onRepaid?.(updated);
              await refreshUser();
            })
          }
        >
          Погасить
        </Button>
      </div>

    </div>
  );
}
