"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { transactionsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { SpendingChartsPanel } from "./SpendingChartsPanel";
import type { TransactionResponse } from "@/types";
import {
  CHART_FETCH_PAGE_SIZE,
  mergeUniqueTransactions,
  utcCalendarDayKeysLast7,
  buildAllAccountsChartBlocks,
} from "@/lib/spending-charts";

export function AllAccountsSpendingSection() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const dayKeys7 = useMemo(() => utcCalendarDayKeysLast7(), []);

  const blocks = useMemo(
    () =>
      user?.accounts?.length
        ? buildAllAccountsChartBlocks(
            txs,
            user.accounts.map((a) => a.account_id),
            dayKeys7
          )
        : [],
    [txs, user?.accounts, dayKeys7]
  );

  const load = useCallback(async () => {
    if (!user?.accounts?.length) {
      setTxs([]);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        user.accounts.map((a) =>
          transactionsApi.getRecent(a.account_id, 0, CHART_FETCH_PAGE_SIZE)
        )
      );
      setTxs(mergeUniqueTransactions(results.map((r) => r.transactions)));
    } catch {
      setTxs([]);
    } finally {
      setLoading(false);
    }
  }, [user?.accounts]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user?.accounts?.length) return null;

  return (
    <section>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
          <div>
            <CardTitle className="text-lg">Траты по всем счетам</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Окно 7 дней ({dayKeys7[0]} — {dayKeys7[6]}), по валютам отдельно.
            </p>
          </div>
          <Link
            href="/dashboard/transactions?tab=history"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 shrink-0"
          >
            Операции
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
            </div>
          ) : blocks.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Нет расходов за период по всем счетам.
            </p>
          ) : (
            <div className="space-y-4">
              {blocks.map((block) => (
                <SpendingChartsPanel
                  key={block.currency}
                  title={`Все счета · ${block.currency}`}
                  currency={block.currency}
                  dayBars={block.dayBars}
                  categorySlices={block.categorySlices}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
