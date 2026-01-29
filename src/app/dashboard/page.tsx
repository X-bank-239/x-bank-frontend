"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AccountCard } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  const totalBalance = user?.accounts?.reduce((sum, acc) => {
    const rates: Record<string, number> = {
      RUB: 1,
      USD: 90,
      EUR: 100,
      CNY: 13,
    };
    return sum + acc.balance * (rates[acc.currency] || 1);
  }, 0) || 0;

  const formattedBalance = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalBalance);

  return (
    <div className="space-y-8">
      {/* Блок «Доступно» — как в Сбербанк Онлайн: крупно по центру */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          Доступно
        </p>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {formattedBalance}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Сумма по всем счетам в рублях
        </p>
      </section>

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
            href="/dashboard/transactions"
            className="flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-center text-sm font-medium text-slate-800 dark:text-slate-100">
              Платежи
            </span>
          </Link>
        </div>
      </section>

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
              <AccountCard key={account.account_id} account={account} variant="minimal" />
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
  );
}
