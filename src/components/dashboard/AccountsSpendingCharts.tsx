"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency, getAccountTypeName } from "@/lib/utils";
import type { BankAccountResponse } from "@/types";
import { SpendingChartsPanel } from "./SpendingChartsPanel";
import { useAccountsSpendingCharts } from "./useAccountsSpendingCharts";

function accountChartTitle(account: BankAccountResponse): string {
  return `${getAccountTypeName(account.account_type)} · ${account.currency}`;
}

function accountChartSubtitle(account: BankAccountResponse): string {
  return `Баланс ${formatCurrency(account.balance, account.currency)} · ${account.account_id.slice(0, 8)}…`;
}

function chartHasData(dayBars: { amount: number }[], categorySlices: { amount: number }[]): boolean {
  return dayBars.some((d) => d.amount > 0) || categorySlices.some((s) => s.amount > 0);
}

type AccountsSpendingChartsProps = {
  accounts?: BankAccountResponse[];
  emptyMessage?: string;
  refreshKey?: number;
  /** summary — сводка по всем счетам (дашборд); perAccount — по каждому счёту */
  mode?: "summary" | "perAccount";
  /** plain — только диаграммы; dashboard — карточка на главной со сводкой */
  variant?: "plain" | "dashboard";
};

function ChartsContent({
  accounts,
  emptyMessage,
  refreshKey,
  mode,
}: {
  accounts: BankAccountResponse[];
  emptyMessage: string;
  refreshKey: number;
  mode: "summary" | "perAccount";
}) {
  const { chartsByAccount, summaryByCurrency, loading, dayKeys7, error } =
    useAccountsSpendingCharts(accounts, refreshKey);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Не удалось загрузить часть операций. Обновите страницу.
      </p>
    );
  }

  if (mode === "summary") {
    const hasAny = summaryByCurrency.some((b) =>
      chartHasData(b.dayBars, b.categorySlices)
    );
    if (!hasAny) {
      return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>;
    }
    return (
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Сводка по всем счетам · окно 7 дней ({dayKeys7[0]} — {dayKeys7[6]}), по валютам.
        </p>
        {summaryByCurrency.map((block) => {
          if (!chartHasData(block.dayBars, block.categorySlices)) return null;
          return (
            <SpendingChartsPanel
              key={block.currency}
              title={`Все счета · ${block.currency}`}
              currency={block.currency}
              dayBars={block.dayBars}
              categorySlices={block.categorySlices}
            />
          );
        })}
      </div>
    );
  }

  const hasAny = chartsByAccount.some((c) =>
    chartHasData(c.dayBars, c.categorySlices)
  );
  if (!hasAny) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>;
  }

  const periodHint =
    accounts.length === 1
      ? `Окно 7 дней (${dayKeys7[0]} — ${dayKeys7[6]}), по выбранному счёту.`
      : `Окно 7 дней (${dayKeys7[0]} — ${dayKeys7[6]}), отдельно по каждому счёту.`;

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{periodHint}</p>
      {chartsByAccount.map((chart) => {
        if (!chartHasData(chart.dayBars, chart.categorySlices)) return null;
        return (
          <SpendingChartsPanel
            key={chart.account.account_id}
            title={accountChartTitle(chart.account)}
            subtitle={accountChartSubtitle(chart.account)}
            currency={chart.account.currency}
            dayBars={chart.dayBars}
            categorySlices={chart.categorySlices}
          />
        );
      })}
    </div>
  );
}

export function AccountsSpendingCharts({
  accounts: accountsProp,
  emptyMessage = "Нет операций за период.",
  refreshKey = 0,
  mode: modeProp,
  variant = "plain",
}: AccountsSpendingChartsProps) {
  const { user, isLoading: authLoading } = useAuth();
  const accounts = accountsProp ?? user?.accounts;
  const mode = modeProp ?? (variant === "dashboard" ? "summary" : "perAccount");

  if (authLoading) {
    const loader = (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
      </div>
    );
    if (variant === "dashboard") {
      return (
        <section>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Сводка по счетам</CardTitle>
            </CardHeader>
            <CardContent>{loader}</CardContent>
          </Card>
        </section>
      );
    }
    return loader;
  }

  if (!accounts?.length) return null;

  const content = (
    <ChartsContent
      accounts={accounts}
      emptyMessage={emptyMessage}
      refreshKey={refreshKey}
      mode={mode}
    />
  );

  if (variant === "dashboard") {
    return (
      <section>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-lg">Сводка по счетам</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                Все операции за 7 дней по валютам (суммарно по всем счетам).
              </p>
            </div>
            <Link
              href="/dashboard/transactions?tab=history"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 shrink-0"
            >
              По счетам
            </Link>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      </section>
    );
  }

  return content;
}
