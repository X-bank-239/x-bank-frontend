"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { BankAccountResponse } from "@/types";
import { Card, CardContent } from "@/components/ui";
import {
  formatCurrency,
  formatLoanInterestRateText,
  formatSavingsInterestRateText,
  getAccountTypeName,
} from "@/lib/utils";
import { LoanRepaymentForm } from "./LoanRepaymentForm";

interface AccountQuickActionsModalProps {
  account: BankAccountResponse | null;
  open: boolean;
  onClose: () => void;
  nextPaymentDate?: string;
  annualInterestRate?: number;
  savingsInterestRate?: number;
}

export function AccountQuickActionsModal({
  account,
  open,
  onClose,
  nextPaymentDate,
  annualInterestRate,
  savingsInterestRate,
}: AccountQuickActionsModalProps) {
  const hasActiveLoanDetails =
    Boolean(nextPaymentDate) || typeof annualInterestRate === "number";
  const showSavingsRate =
    account?.account_type === "SAVINGS" && typeof savingsInterestRate === "number";

  useEffect(() => {
    if (!open) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open || !account) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="pt-5 pb-5 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {getAccountTypeName(account.account_type)} · {account.currency}
              </p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1 break-all">
                {account.account_id}
              </p>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-2">
                {formatCurrency(account.balance, account.currency)}
              </p>
              {hasActiveLoanDetails && nextPaymentDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  След. платеж: {nextPaymentDate}
                </p>
              )}
              {hasActiveLoanDetails && typeof annualInterestRate === "number" && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatLoanInterestRateText(annualInterestRate)}
                </p>
              )}
              {showSavingsRate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatSavingsInterestRateText(savingsInterestRate)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Закрыть быстрые действия"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
              Быстрые действия
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Link
                href={`/dashboard/transactions?account=${account.account_id}&tab=transfer`}
                onClick={onClose}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
              >
                Перевод
              </Link>
              <Link
                href={`/dashboard/transactions?account=${account.account_id}&tab=payment`}
                onClick={onClose}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
              >
                Платёж
              </Link>
              <Link
                href={`/dashboard/transactions?account=${account.account_id}&tab=history`}
                onClick={onClose}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
              >
                История
              </Link>
            </div>
          </div>

          {hasActiveLoanDetails && (
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 mt-3">
                Погашение кредита
              </p>
              <LoanRepaymentForm debitAccountId={account.account_id} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
