"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AccountCard,
  AccountQuickActionsModal,
  AccountsSpendingCharts,
} from "@/components/dashboard";
import { Card, CardContent, Button } from "@/components/ui";
import Link from "next/link";
import { loansApi, savingsApi } from "@/lib/api";
import type { BankAccountResponse, LoanResponse, SavingsAccount } from "@/types";
import { formatAnnualInterestRate, formatCurrency, getLoanStatusLabel } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<BankAccountResponse | null>(null);
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);

  const [loansExpanded, setLoansExpanded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [loanList, savingsList] = await Promise.all([
          loansApi.list(),
          savingsApi.getAll().catch(() => [] as SavingsAccount[]),
        ]);
        setLoans(loanList);
        setSavingsAccounts(savingsList);
      } catch {
        // Не блокируем дашборд при недоступности списков.
      }
    })();
  }, []);

  const nextPaymentByAccountId = useMemo(() => {
    const map = new Map<string, string>();
    for (const loan of loans) {
      if (loan.status !== "ACTIVE") continue;
      map.set(loan.debitAccountId, loan.nextPaymentDate);
      map.set(loan.serviceAccountId, loan.nextPaymentDate);
    }
    return map;
  }, [loans]);

  const annualRateByAccountId = useMemo(() => {
    const map = new Map<string, number>();
    for (const loan of loans) {
      if (loan.status !== "ACTIVE") continue;
      map.set(loan.debitAccountId, loan.annualInterestRate);
      map.set(loan.serviceAccountId, loan.annualInterestRate);
    }
    return map;
  }, [loans]);

  const savingsRateByAccountId = useMemo(() => {
    const map = new Map<string, number>();
    for (const savings of savingsAccounts) {
      map.set(savings.accountId, savings.interestRate);
    }
    return map;
  }, [savingsAccounts]);

  const loansToShow = loans.length > 5 && !loansExpanded ? loans.slice(0, 5) : loans;

  // const totalBalance = user?.accounts?.reduce((sum, acc) => {
  //   const rates: Record<string, number> = {
  //     RUB: 1,
  //     USD: 90,
  //     EUR: 100,
  //     CNY: 13,
  //   };
  //   return sum + acc.balance * (rates[acc.currency] || 1);
  // }, 0) || 0;

  // const formattedBalance = new Intl.NumberFormat("ru-RU", {
  //   style: "currency",
  //   currency: "RUB",
  //   minimumFractionDigits: 0,
  //   maximumFractionDigits: 0,
  // }).format(totalBalance);

  return (
    <>
      <div className="space-y-8">
        {/* Быстрые действия — горизонтальный ряд как в Сбере */}
        <section>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
            Быстрые действия
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Link
                href="/dashboard/transactions"
                className="flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-center text-sm font-medium text-slate-800 dark:text-slate-100">
              Перевод
            </span>
            </Link>
            <Link
                href="/dashboard/transactions"
                className="flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-center text-sm font-medium text-slate-800 dark:text-slate-100">
              Пополнить
            </span>
            </Link>
            <Link
                href="/dashboard/loans"
                className="flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-center text-sm font-medium text-slate-800 dark:text-slate-100">
              Кредит
            </span>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Данные кредита
            </h2>
            <Link
              href="/dashboard/loans"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700"
            >
              Кредит
            </Link>
          </div>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="pt-5 pb-5">
              {loans.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Кредитов нет. Оформление и погашение — в разделе{" "}
                  <Link
                    href="/dashboard/loans"
                    className="font-medium text-primary-600 dark:text-primary-400 underline"
                  >
                    Кредит
                  </Link>
                  .
                </p>
              ) : (
                <ul className="space-y-3">
                  {loansToShow.map((loan) => (
                    <li
                      key={loan.loanId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          Остаток: {formatCurrency(loan.outstandingPrincipal, loan.currency)} ·{" "}
                          {loan.currency}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {getLoanStatusLabel(loan.status)}
                          {" "}
                          · Ставка по кредиту: {formatAnnualInterestRate(loan.annualInterestRate)} годовых
                          {loan.status === "ACTIVE" && loan.nextPaymentDate ? (
                            <>
                              {" "}
                              · Платёж: {loan.nextPaymentDate.slice(0, 10)} · Платёж в месяц:{" "}
                              {formatCurrency(loan.monthlyPayment, loan.currency)}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">
                        {loan.loanId.slice(0, 8)}…
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {loans.length > 5 ? (
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLoansExpanded((v) => !v)}
                  >
                    {loansExpanded ? "Свернуть" : `Показать все кредиты (${loans.length})`}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <AccountsSpendingCharts
          variant="dashboard"
          mode="summary"
          emptyMessage="Нет операций за период по всем счетам."
        />

        {/* Мои счета / Вклады и счета — как в Сбере */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Мои счета
            </h2>
            <Link
                href="/dashboard/accounts"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700"
            >
              Все счета
            </Link>
          </div>

          {user?.accounts && user.accounts.length > 0 ? (
              <div className="space-y-3">
                {user.accounts.slice(0, 5).map((account) => (
                  <AccountCard
                    key={account.account_id}
                    account={account}
                    variant="minimal"
                    nextPaymentDate={nextPaymentByAccountId.get(account.account_id)}
                    annualInterestRate={annualRateByAccountId.get(account.account_id)}
                    savingsInterestRate={savingsRateByAccountId.get(account.account_id)}
                    onClick={() => setSelectedAccount(account)}
                  />
                ))}
                {user.accounts.length > 5 && (
                    <Link
                        href="/dashboard/accounts"
                        className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      Показать все счета ({user.accounts.length})
                    </Link>
                )}
              </div>
          ) : (
              <Card className="border-slate-200 dark:border-slate-800">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <svg
                        className="h-7 w-7 text-slate-400 dark:text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">У вас пока нет счетов</p>
                  <Link
                      href="/dashboard/accounts"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Открыть счёт
                  </Link>
                </CardContent>
              </Card>
          )}
        </section>
      </div>
      <AccountQuickActionsModal
        account={selectedAccount}
        open={Boolean(selectedAccount)}
        onClose={() => setSelectedAccount(null)}
        nextPaymentDate={
          selectedAccount
            ? nextPaymentByAccountId.get(selectedAccount.account_id)
            : undefined
        }
        annualInterestRate={
          selectedAccount
            ? annualRateByAccountId.get(selectedAccount.account_id)
            : undefined
        }
        savingsInterestRate={
          selectedAccount
            ? savingsRateByAccountId.get(selectedAccount.account_id)
            : undefined
        }
      />
    </>
  );
}