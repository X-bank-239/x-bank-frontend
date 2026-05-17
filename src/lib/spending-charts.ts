import type { Currency, TransactionResponse } from "@/types";
import { formatShortDate } from "@/lib/utils";

export const CHART_FETCH_PAGE_SIZE = 500;

export type SpendingSlice = { label: string; amount: number };
export type DayBar = {
  dateKey: string;
  label: string;
  amount: number;
  barPercent: number;
};

export function utcCalendarDayKeysLast7(): string[] {
  const out: string[] = [];
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(Date.UTC(y, m, d - i));
    out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}

export function mergeUniqueTransactions(arrays: TransactionResponse[][]): TransactionResponse[] {
  const seen = new Set<string>();
  const out: TransactionResponse[] = [];
  for (const arr of arrays) {
    for (const tx of arr) {
      const key = `${tx.transaction_date}|${tx.amount}|${tx.transaction_type}|${tx.sender_id ?? ""}|${tx.receiver_id ?? ""}|${tx.comment ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(tx);
    }
  }
  return out;
}

export function filterOutgoing(
  txs: TransactionResponse[],
  mode: { type: "account"; accountId: string } | { type: "all"; accountIds: Set<string> }
): TransactionResponse[] {
  return txs.filter((tx) => {
    if (tx.transaction_type === "PAYMENT") {
      if (mode.type === "account") return true;
      return !tx.sender_id || mode.accountIds.has(tx.sender_id);
    }
    if (tx.transaction_type !== "TRANSFER") return false;
    return mode.type === "account"
      ? tx.sender_id === mode.accountId
      : !!tx.sender_id && mode.accountIds.has(tx.sender_id);
  });
}

export function filterInUtcDaySet(txs: TransactionResponse[], dayKeys: string[]): TransactionResponse[] {
  const set = new Set(dayKeys);
  return txs.filter((tx) => set.has(tx.transaction_date.slice(0, 10)));
}

export function aggregateSpendingByDay(dayKeys: string[], outgoing: TransactionResponse[]): DayBar[] {
  const byDay: Record<string, number> = Object.fromEntries(dayKeys.map((k) => [k, 0]));
  for (const tx of outgoing) {
    const day = tx.transaction_date.slice(0, 10);
    if (day in byDay) byDay[day] = (byDay[day] ?? 0) + tx.amount;
  }
  const amounts = dayKeys.map((k) => byDay[k] ?? 0);
  const max = Math.max(...amounts, 0);
  return dayKeys.map((dateKey) => {
    const amount = byDay[dateKey] ?? 0;
    return {
      dateKey,
      label: formatShortDate(dateKey),
      amount,
      barPercent: max > 0 ? (amount / max) * 100 : 0,
    };
  });
}

export function aggregateByCategorySorted(outgoing: TransactionResponse[]): SpendingSlice[] {
  const cat: Record<string, number> = {};
  for (const tx of outgoing) {
    const key = (tx.category && tx.category.trim()) || "Без категории";
    cat[key] = (cat[key] ?? 0) + tx.amount;
  }
  return Object.entries(cat)
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount || a.label.localeCompare(b.label, "ru"));
}

export function groupByCurrency(
  txs: TransactionResponse[]
): Partial<Record<Currency, TransactionResponse[]>> {
  const m: Partial<Record<Currency, TransactionResponse[]>> = {};
  for (const tx of txs) {
    if (!m[tx.currency]) m[tx.currency] = [];
    m[tx.currency]!.push(tx);
  }
  return m;
}

export type AllAccountsChartBlock = {
  currency: Currency;
  dayBars: DayBar[];
  categorySlices: SpendingSlice[];
};

export function buildAllAccountsChartBlocks(
  txs: TransactionResponse[],
  accountIds: string[],
  dayKeys: string[]
): AllAccountsChartBlock[] {
  if (!accountIds.length) return [];
  const ids = new Set(accountIds);
  const outgoing = filterOutgoing(txs, { type: "all", accountIds: ids });
  const inWin = filterInUtcDaySet(outgoing, dayKeys);
  const byCur = groupByCurrency(inWin);
  return (Object.keys(byCur) as Currency[])
    .sort()
    .map((currency) => {
      const txsCur = byCur[currency] ?? [];
      return {
        currency,
        dayBars: aggregateSpendingByDay(dayKeys, txsCur),
        categorySlices: aggregateByCategorySorted(txsCur),
      };
    });
}

export function buildAccountChartData(
  txs: TransactionResponse[],
  accountId: string,
  dayKeys: string[]
): { dayBars: DayBar[]; categorySlices: SpendingSlice[] } {
  const outgoing = filterOutgoing(txs, { type: "account", accountId });
  const inWin = filterInUtcDaySet(outgoing, dayKeys);
  return {
    dayBars: aggregateSpendingByDay(dayKeys, inWin),
    categorySlices: aggregateByCategorySorted(inWin),
  };
}
