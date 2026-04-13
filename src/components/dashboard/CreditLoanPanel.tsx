"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { loansApi } from "@/lib/api";
import type { LoanResponse } from "@/types";
import { Button, Card, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { LoanRepaymentForm } from "./LoanRepaymentForm";

function isLoanOverdue(nextPaymentDate: string, status: LoanResponse["status"]): boolean {
  if (status !== "ACTIVE") return false;
  const due = new Date(nextPaymentDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/** Оформление кредита на главной и свёрнутый блок: получение/погашение по creditAccountId. */
export function CreditLoanPanel() {
  const { user, refreshUser } = useAuth();

  const creditAccounts = useMemo(
    () => (user?.accounts ?? []).filter((a) => a.account_type === "CREDIT"),
    [user]
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loan, setLoan] = useState<LoanResponse | null>(null);

  const [createCreditAccountId, setCreateCreditAccountId] = useState(
    creditAccounts[0]?.account_id ?? ""
  );
  const [principalAmount, setPrincipalAmount] = useState("100000");
  const [termMonths, setTermMonths] = useState("12");

  useEffect(() => {
    if (creditAccounts.length === 0) return;
    if (!createCreditAccountId || !creditAccounts.some((a) => a.account_id === createCreditAccountId)) {
      setCreateCreditAccountId(creditAccounts[0]!.account_id);
    }
  }, [creditAccounts, createCreditAccountId]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
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

      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="pt-5 pb-5 space-y-4">
          {creditAccounts.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Для кредита нужен кредитный счёт —{" "}
              <Link
                href="/dashboard/accounts"
                className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                откройте в «Вклады и счета»
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Кредитный счёт
                  </label>
                  <select
                    value={createCreditAccountId}
                    onChange={(e) => setCreateCreditAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    {creditAccounts.map((a) => (
                      <option key={a.account_id} value={a.account_id}>
                        {a.currency} · {formatCurrency(a.balance, a.currency)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Сумма
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Срок (мес.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>
              <Button
                disabled={
                  busy ||
                  !createCreditAccountId ||
                  Number(principalAmount) <= 0 ||
                  Number(termMonths) <= 0
                }
                onClick={() =>
                  run(async () => {
                    const created = await loansApi.create({
                      creditAccountId: createCreditAccountId,
                      principalAmount: Number(principalAmount),
                      termMonths: Number(termMonths),
                    });
                    setLoan(created);
                    setMessage(`Кредит создан. Loan ID: ${created.loanId}`);
                    await refreshUser();
                  })
                }
              >
                {busy ? "Оформление..." : "Оформить кредит"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <details className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm open:shadow-md transition-shadow">
        <summary className="cursor-pointer list-none px-4 py-3.5 sm:px-5 flex items-center justify-between gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl [&::-webkit-details-marker]:hidden">
          <span>Погашение и детали</span>
          <svg
            className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 sm:px-5 sm:pb-5 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Погашение
            </p>
            <LoanRepaymentForm
              creditAccountId={createCreditAccountId}
              onRepaid={(updatedLoan) => setLoan(updatedLoan)}
            />
          </div>

          {loan && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-4 text-sm space-y-2">
              <p className="font-medium text-slate-800 dark:text-slate-100">Текущие данные</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Loan ID:</span>{" "}
                  <span className="font-mono text-xs break-all">{loan.loanId}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Статус:</span> {loan.status}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">Кредитный счёт:</span>{" "}
                  <span className="font-mono text-xs break-all">{loan.creditAccountId}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Остаток:</span>{" "}
                  {formatCurrency(loan.outstandingPrincipal, loan.currency)}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Платёж в месяц:</span>{" "}
                  {formatCurrency(loan.monthlyPayment, loan.currency)}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Ставка (год.):</span>{" "}
                  {Math.round(loan.annualInterestRate * 10000) / 100}%
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">След. платёж:</span>{" "}
                  {loan.nextPaymentDate}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Срок (мес.):</span>{" "}
                  {loan.termMonths}
                </div>
                {isLoanOverdue(loan.nextPaymentDate, loan.status) && (
                  <div className="sm:col-span-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-red-700 dark:text-red-400 text-sm">
                    Просрочка: дата следующего платежа ({loan.nextPaymentDate}) уже прошла.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
