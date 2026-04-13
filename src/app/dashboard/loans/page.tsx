"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loansApi } from "@/lib/api";
import {
  assertLoanActiveForRepayment,
  mapLoanRepaymentApiError,
} from "@/lib/loan-repayment";
import type { LoanResponse } from "@/types";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

function isLoanOverdue(nextPaymentDate: string, status: LoanResponse["status"]): boolean {
  if (status !== "ACTIVE") return false;
  const due = new Date(nextPaymentDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export default function LoansPage() {
  const { user, refreshUser } = useAuth();

  const creditAccounts = useMemo(
    () => (user?.accounts ?? []).filter((a) => a.account_type === "CREDIT"),
    [user]
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loan, setLoan] = useState<LoanResponse | null>(null);
  const [loans, setLoans] = useState<LoanResponse[]>([]);

  const [createCreditAccountId, setCreateCreditAccountId] = useState(
    creditAccounts[0]?.account_id ?? ""
  );
  const selectedCreditAccount = useMemo(() => {
    return (
      creditAccounts.find((a) => a.account_id === createCreditAccountId) ??
      creditAccounts[0]
    );
  }, [creditAccounts, createCreditAccountId]);

  const [principalAmount, setPrincipalAmount] = useState("100000");
  const [termMonths, setTermMonths] = useState("12");
  const [creditAccountId, setCreditAccountId] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [repayMode, setRepayMode] = useState<"MONTHLY" | "EARLY">("MONTHLY");

  useEffect(() => {
    if (creditAccounts.length === 0) return;
    if (!createCreditAccountId || !creditAccounts.some((a) => a.account_id === createCreditAccountId)) {
      setCreateCreditAccountId(creditAccounts[0]!.account_id);
    }
  }, [creditAccounts, createCreditAccountId]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await loansApi.list();
        setLoans(data);
      } catch {
        // Не блокируем страницу, если список временно недоступен.
      }
    })();
  }, []);

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

  const selectedLoan = useMemo(() => {
    if (loan?.creditAccountId === creditAccountId) return loan;
    return loans.find((item) => item.creditAccountId === creditAccountId) ?? null;
  }, [loan, loans, creditAccountId]);

  const canRepay =
    Boolean(creditAccountId) && selectedLoan?.status === "ACTIVE";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Кредиты</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Оформление кредита и погашение.
        </p>
      </div>

      {(error || message) && (
        <div
          className={
            error
              ? "p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm"
              : "p-4 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 text-sm"
          }
        >
          {error || message}
        </div>
      )}

      <Card accent>
        <CardHeader>
          <CardTitle>Создать кредит</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {creditAccounts.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Нужен кредитный счёт (тип{" "}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">CREDIT</code>) —{" "}
              <Link
                href="/dashboard/accounts"
                className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                откройте на странице счетов
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
                    if (!selectedCreditAccount) {
                      throw new Error("Не удалось определить кредитный счёт");
                    }
                    const created = await loansApi.create({
                      creditAccountId: createCreditAccountId,
                      principalAmount: Number(principalAmount),
                      termMonths: Number(termMonths),
                    });
                    setLoan(created);
                    setLoans((prev) => [created, ...prev.filter((l) => l.loanId !== created.loanId)]);
                    setCreditAccountId(created.creditAccountId);
                    setMessage("Кредит создан.");
                    await refreshUser();
                  })
                }
              >
                Создать
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Погашение</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Кредит из списка
              </label>
              <select
                value={creditAccountId}
                onChange={(e) => {
                  const id = e.target.value;
                  setCreditAccountId(id);
                  const found = loans.find((item) => item.creditAccountId === id) ?? null;
                  setLoan(found);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="">Выберите кредит</option>
                {loans.map((item) => {
                  const overdue = isLoanOverdue(item.nextPaymentDate, item.status);
                  return (
                    <option key={item.loanId} value={item.creditAccountId}>
                      {item.creditAccountId} · {item.status}
                      {overdue ? " · ПРОСРОЧКА" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Обновить список
              </label>
              <Button
                variant="outline"
                className="w-full"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const data = await loansApi.list();
                    setLoans(data);
                    setMessage("Список кредитов обновлен.");
                  })
                }
              >
                Обновить
              </Button>
            </div>
          </div>
          {selectedLoan && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                isLoanOverdue(selectedLoan.nextPaymentDate, selectedLoan.status)
                  ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs break-all">{selectedLoan.loanId}</span>
                <span className="text-xs">{selectedLoan.status}</span>
              </div>
              <div className="mt-1 text-slate-600 dark:text-slate-300">
                След. платеж: {selectedLoan.nextPaymentDate} · Срок: {selectedLoan.termMonths} мес.
              </div>
              {isLoanOverdue(selectedLoan.nextPaymentDate, selectedLoan.status) && (
                <p className="mt-1 text-xs font-medium text-red-700 dark:text-red-400">
                  Есть просрочка: дата следующего платежа уже прошла.
                </p>
              )}
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
              disabled={busy || !creditAccountId || !canRepay}
              onClick={() =>
                run(async () => {
                  const data =
                    loan?.creditAccountId === creditAccountId
                      ? loan
                      : await loansApi.get(creditAccountId);
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
              disabled={busy || !creditAccountId || !canRepay}
              onClick={() =>
                run(async () => {
                  const loanForCost = await loansApi.get(creditAccountId);
                  assertLoanActiveForRepayment(loanForCost);
                  const cost = await loansApi.fullPaymentCost(creditAccountId);
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
                !creditAccountId ||
                !canRepay ||
                Number(repayAmount) <= 0
              }
              onClick={() =>
                run(async () => {
                  const before =
                    loan?.creditAccountId === creditAccountId
                      ? loan
                      : await loansApi.get(creditAccountId);
                  assertLoanActiveForRepayment(before);
                  const amount = Number(repayAmount);
                  const updated =
                    repayMode === "MONTHLY"
                      ? await loansApi.repayMonthly(creditAccountId, { amount })
                      : await loansApi.repayEarly(creditAccountId, { amount });
                  setLoan(updated);
                  setMessage(
                    repayMode === "MONTHLY"
                      ? "Ежемесячный платёж выполнен."
                      : "Досрочное погашение выполнено."
                  );
                  await refreshUser();
                })
              }
            >
              Погасить
            </Button>
          </div>
        </CardContent>
      </Card>

      {loan && (
        <Card>
          <CardHeader>
            <CardTitle>Данные кредита</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
