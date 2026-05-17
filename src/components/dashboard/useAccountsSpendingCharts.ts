"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categoriesApi, transactionsApi } from "@/lib/api";
import {
  CHART_FETCH_PAGE_SIZE,
  buildAccountChartData,
  buildAllAccountsSummaryBlocks,
  buildCategoryDisplayNameMap,
  utcCalendarDayKeysLast7,
} from "@/lib/spending-charts";
import type { BankAccountResponse, TransactionCategory, TransactionResponse } from "@/types";
import type { CurrencySummaryBlock, DayBar, SpendingSlice } from "@/lib/spending-charts";

export type AccountSpendingChart = {
  account: BankAccountResponse;
  dayBars: DayBar[];
  categorySlices: SpendingSlice[];
};

function accountIdsKey(accounts: BankAccountResponse[] | undefined): string {
  if (!accounts?.length) return "";
  return accounts
    .map((a) => a.account_id)
    .sort()
    .join("|");
}

export function useAccountsSpendingCharts(
  accounts: BankAccountResponse[] | undefined,
  refreshKey = 0
) {
  const [txsByAccountId, setTxsByAccountId] = useState<Record<string, TransactionResponse[]>>({});
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const idsKey = accountIdsKey(accounts);
  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;
  const dayKeys7 = useMemo(() => utcCalendarDayKeysLast7(), []);

  const categoryNames = useMemo(
    () => buildCategoryDisplayNameMap(categories),
    [categories]
  );

  const load = useCallback(async () => {
    const list = accountsRef.current;
    if (!list?.length || !idsKey) {
      setTxsByAccountId({});
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const [categoryResult, ...txResults] = await Promise.allSettled([
        categoriesApi.getAll(),
        ...list.map((a) =>
          transactionsApi.getRecent(a.account_id, 0, CHART_FETCH_PAGE_SIZE)
        ),
      ]);

      const categoryList =
        categoryResult.status === "fulfilled" ? categoryResult.value : [];
      setCategories(categoryList);

      const byAccount: Record<string, TransactionResponse[]> = {};
      let failed = categoryResult.status === "rejected";
      list.forEach((account, index) => {
        const result = txResults[index];
        if (result?.status === "fulfilled") {
          byAccount[account.account_id] = result.value.transactions;
        } else {
          failed = true;
          byAccount[account.account_id] = [];
        }
      });
      setTxsByAccountId(byAccount);
      setError(failed);
    } catch {
      setTxsByAccountId({});
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [idsKey]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const chartsByAccount = useMemo((): AccountSpendingChart[] => {
    if (!accounts?.length) return [];
    return accounts.map((account) => {
      const txs = txsByAccountId[account.account_id] ?? [];
      const { dayBars, categorySlices } = buildAccountChartData(txs, dayKeys7, categoryNames);
      return { account, dayBars, categorySlices };
    });
  }, [accounts, txsByAccountId, dayKeys7, categoryNames]);

  const summaryByCurrency = useMemo((): CurrencySummaryBlock[] => {
    if (!accounts?.length) return [];
    const arrays = accounts.map((a) => txsByAccountId[a.account_id] ?? []);
    return buildAllAccountsSummaryBlocks(arrays, dayKeys7, categoryNames);
  }, [accounts, txsByAccountId, dayKeys7, categoryNames]);

  return {
    chartsByAccount,
    summaryByCurrency,
    loading,
    dayKeys7,
    error,
  };
}
