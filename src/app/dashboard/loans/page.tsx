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
import { LoanCreateInterestHint } from "@/components/dashboard/LoanCreateInterestHint";
import { useLoanFullDebt } from "@/hooks/useLoanFullDebt";
import { formatAnnualInterestRate, formatCurrency, getLoanStatusLabel } from "@/lib/utils";
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

  const debitAccounts = useMemo(
    () => (user?.accounts ?? []).filter((a) => a.account_type === "DEBIT"),
    [user]
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loan, setLoan] = useState<LoanResponse | null>(null);
  const [loans, setLoans] = useState<LoanResponse[]>([]);

  const [createCreditAccountId, setCreateCreditAccountId] = useState(
    debitAccounts[0]?.account_id ?? ""
  );
  const selectedCreditAccount = useMemo(() => {
    return (
      debitAccounts.find((a) => a.account_id === createCreditAccountId) ??
      debitAccounts[0]
    );
  }, [debitAccounts, createCreditAccountId]);

  const [principalAmount, setPrincipalAmount] = useState("100000");
  const [termMonths, setTermMonths] = useState("12");
  const [repayDebitAccountId, setRepayDebitAccountId] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [repayMode, setRepayMode] = useState<"MONTHLY" | "EARLY">("MONTHLY");

  useEffect(() => {
    if (debitAccounts.length === 0) return;
    if (!createCreditAccountId || !debitAccounts.some((a) => a.account_id === createCreditAccountId)) {
      setCreateCreditAccountId(debitAccounts[0]!.account_id);
    }
  }, [debitAccounts, createCreditAccountId]);

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
    if (loan?.debitAccountId === repayDebitAccountId) return loan;
    return loans.find((item) => item.debitAccountId === repayDebitAccountId) ?? null;
  }, [loan, loans, repayDebitAccountId]);

  const canRepay =
    Boolean(repayDebitAccountId) && selectedLoan?.status === "ACTIVE";

  const loanForDetails = loan ?? selectedLoan;
  const loanFullDebt = useLoanFullDebt(loanForDetails);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Кредит</h1>
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
          {debitAccounts.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Нужен дебетовый счёт —{" "}
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
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="w-full sm:flex-1 sm:min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Счёт зачисления и погашения (дебетовый)
                  </label>
                  <select
                    value={createCreditAccountId}
                    onChange={(e) => setCreateCreditAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    {debitAccounts.map((a) => (
                      <option key={a.account_id} value={a.account_id}>
                        {a.currency} · {formatCurrency(a.balance, a.currency)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-40 sm:shrink-0">
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
                <div className="w-full sm:w-36 sm:shrink-0">
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
                <div className="w-full sm:w-auto sm:shrink-0">
                  <div className="mb-1 hidden h-5 sm:block" aria-hidden />
                  <Button
                    className="w-full sm:w-auto"
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
                          debitAccountId: createCreditAccountId,
                          principalAmount: Number(principalAmount),
                          termMonths: Number(termMonths),
                        });
                        setLoan(created);
                        setLoans((prev) => [created, ...prev.filter((l) => l.loanId !== created.loanId)]);
                        setRepayDebitAccountId(created.debitAccountId);
                        setMessage(
                          `Кредит создан. Ставка по кредиту: ${formatAnnualInterestRate(created.annualInterestRate)}.`
                        );
                        await refreshUser();
                      })
                    }
                  >
                    Создать
                  </Button>
                </div>
              </div>
              <LoanCreateInterestHint />
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
                value={repayDebitAccountId}
                onChange={(e) => {
                  const id = e.target.value;
                  setRepayDebitAccountId(id);
                  const found = loans.find((item) => item.debitAccountId === id) ?? null;
                  setLoan(found);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="">Выберите кредит</option>
                {loans.map((item) => {
                  const overdue = isLoanOverdue(item.nextPaymentDate, item.status);
                  return (
                    <option key={item.loanId} value={item.debitAccountId}>
                      {item.debitAccountId} · {getLoanStatusLabel(item.status)} · кред.{" "}
                      {formatAnnualInterestRate(item.annualInterestRate)}
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
                <span className="text-xs">{getLoanStatusLabel(selectedLoan.status)}</span>
              </div>
              <div className="mt-1 text-slate-600 dark:text-slate-300">
                След. платеж: {selectedLoan.nextPaymentDate} · Срок: {selectedLoan.termMonths} мес. ·
                Ставка по кредиту: {formatAnnualInterestRate(selectedLoan.annualInterestRate)} годовых
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
              disabled={busy || !repayDebitAccountId || !canRepay}
              onClick={() =>
                run(async () => {
                  const data =
                    loan?.debitAccountId === repayDebitAccountId
                      ? loan
                      : await loansApi.get(repayDebitAccountId);
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
              disabled={busy || !repayDebitAccountId || !canRepay}
              onClick={() =>
                run(async () => {
                  const loanForCost = await loansApi.get(repayDebitAccountId);
                  assertLoanActiveForRepayment(loanForCost);
                  const cost = await loansApi.fullPaymentCost(repayDebitAccountId);
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
                !repayDebitAccountId ||
                !canRepay ||
                Number(repayAmount) <= 0
              }
              onClick={() =>
                run(async () => {
                  const before =
                    loan?.debitAccountId === repayDebitAccountId
                      ? loan
                      : await loansApi.get(repayDebitAccountId);
                  assertLoanActiveForRepayment(before);
                  const amount = Number(repayAmount);
                  const updated =
                    repayMode === "MONTHLY"
                      ? await loansApi.repayMonthly(repayDebitAccountId, { amount })
                      : await loansApi.repayEarly(repayDebitAccountId, { amount });
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

      <Card>
        <CardHeader>
          <CardTitle>Автоплатёж и расчёт ежемесячного платежа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Управление автосписанием и запрос суммы ежемесячного платежа по выбранному дебетовому счёту кредита.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={busy || !canRepay}
              onClick={() =>
                run(async () => {
                  const updated = await loansApi.getAutopayStatusByAccount(repayDebitAccountId);
                  setLoans((prev) => prev.map((l) => (l.loanId === updated.loanId ? updated : l)));
                  setLoan((prev) => (prev?.loanId === updated.loanId ? updated : prev));
                  setMessage(
                    `Автоплатёж: ${updated.autopayEnabled ? "включён" : "выключен"}.`
                  );
                })
              }
            >
              Обновить статус
            </Button>
            <Button
              variant="outline"
              disabled={busy || !canRepay}
              onClick={() =>
                run(async () => {
                  const updated = await loansApi.enableAutopayByAccount(repayDebitAccountId);
                  setLoans((prev) => prev.map((l) => (l.loanId === updated.loanId ? updated : l)));
                  setLoan((prev) => (prev?.loanId === updated.loanId ? updated : prev));
                  setMessage("Автоплатёж включён.");
                })
              }
            >
              Включить автоплатёж
            </Button>
            <Button
              variant="outline"
              disabled={busy || !canRepay}
              onClick={() =>
                run(async () => {
                  const updated = await loansApi.disableAutopayByAccount(repayDebitAccountId);
                  setLoans((prev) => prev.map((l) => (l.loanId === updated.loanId ? updated : l)));
                  setLoan((prev) => (prev?.loanId === updated.loanId ? updated : prev));
                  setMessage("Автоплатёж выключен.");
                })
              }
            >
              Выключить автоплатёж
            </Button>
            <Button
              variant="outline"
              disabled={busy || !canRepay}
              onClick={() =>
                run(async () => {
                  const cost = await loansApi.monthlyPaymentCost(repayDebitAccountId);
                  setMessage(`Сумма ежемесячного платежа по расчёту банка: ${cost.amount}`);
                })
              }
            >
              Расчёт ежемесячного платежа
            </Button>
          </div>
          {selectedLoan && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Текущее состояние в данных: автоплатёж{" "}
              <span className="font-medium">
                {selectedLoan.autopayEnabled ? "включён" : "выключен"}
              </span>
              . Обновите статус после изменений на сервере.
            </p>
          )}
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
                <span className="text-slate-500 dark:text-slate-400">ID кредита:</span>{" "}
                <span className="font-mono text-xs break-all">{loan.loanId}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Статус:</span>{" "}
                {getLoanStatusLabel(loan.status)}
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 dark:text-slate-400">Дебетовый счёт (погашение):</span>{" "}
                <span className="font-mono text-xs break-all">{loan.debitAccountId}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Тело кредита:</span>{" "}
                {formatCurrency(loan.outstandingPrincipal, loan.currency)}
              </div>
              {loan.status === "ACTIVE" && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Общий долг:</span>{" "}
                  {loanFullDebt != null
                    ? formatCurrency(loanFullDebt, loan.currency)
                    : "…"}
                </div>
              )}
              <div>
                <span className="text-slate-500 dark:text-slate-400">Платёж в месяц:</span>{" "}
                {formatCurrency(loan.monthlyPayment, loan.currency)}
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Ставка по кредиту (год.):</span>{" "}
                {formatAnnualInterestRate(loan.annualInterestRate)}
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
