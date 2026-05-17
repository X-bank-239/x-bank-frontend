import type { Currency, TransactionCategory, TransactionResponse } from "@/types";
import { formatShortDate, getTransactionTypeName } from "@/lib/utils";

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

/** Календарный день операции в UTC (совпадает с utcCalendarDayKeysLast7). */
export function transactionUtcDayKey(dateString: string): string {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return dateString.slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function fieldMatchesAccountId(field: string | undefined, accountIds: Set<string>): boolean {
  if (!field) return false;
  return accountIds.has(field);
}

/** Операция относится к одному из счетов пользователя (id или name в API). */
export function transactionTouchesAccounts(
  tx: TransactionResponse,
  accountIds: Set<string>
): boolean {
  if (
    fieldMatchesAccountId(tx.sender_id, accountIds) ||
    fieldMatchesAccountId(tx.receiver_id, accountIds) ||
    fieldMatchesAccountId(tx.sender_name, accountIds) ||
    fieldMatchesAccountId(tx.receiver_name, accountIds)
  ) {
    return true;
  }
  // getRecent уже отфильтровал по счёту; стороны иногда не приходят в ответе.
  if (!tx.sender_id && !tx.receiver_id && !tx.sender_name && !tx.receiver_name) {
    return true;
  }
  return false;
}

/** Операции, относящиеся к счёту (пополнения, переводы, платежи). */
export function filterAccountActivity(
  txs: TransactionResponse[],
  accountId: string
): TransactionResponse[] {
  return txs.filter((tx) => transactionTouchesAccounts(tx, new Set([accountId])));
}

export function buildCategoryDisplayNameMap(
  categories: TransactionCategory[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const category of categories) {
    map.set(category.code, category.display_name);
    map.set(category.code.toUpperCase(), category.display_name);
  }
  return map;
}

function chartCategoryLabel(
  tx: TransactionResponse,
  categoryNames: Map<string, string>
): string {
  const raw = tx.category?.trim();
  if (raw) {
    return categoryNames.get(raw) ?? categoryNames.get(raw.toUpperCase()) ?? raw;
  }
  return getTransactionTypeName(tx.transaction_type);
}

export function filterInUtcDaySet(txs: TransactionResponse[], dayKeys: string[]): TransactionResponse[] {
  const set = new Set(dayKeys);
  return txs.filter((tx) => set.has(transactionUtcDayKey(tx.transaction_date)));
}

function chartMovementAmount(tx: TransactionResponse): number {
  return Math.abs(tx.amount);
}

export function aggregateSpendingByDay(dayKeys: string[], txs: TransactionResponse[]): DayBar[] {
  const byDay: Record<string, number> = Object.fromEntries(dayKeys.map((k) => [k, 0]));
  for (const tx of txs) {
    const day = transactionUtcDayKey(tx.transaction_date);
    if (day in byDay) byDay[day] = (byDay[day] ?? 0) + chartMovementAmount(tx);
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

export function aggregateByCategorySorted(
  txs: TransactionResponse[],
  categoryNames: Map<string, string>
): SpendingSlice[] {
  const cat: Record<string, number> = {};
  for (const tx of txs) {
    const key = chartCategoryLabel(tx, categoryNames);
    cat[key] = (cat[key] ?? 0) + chartMovementAmount(tx);
  }
  return Object.entries(cat)
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount || a.label.localeCompare(b.label, "ru"));
}

export function mergeUniqueTransactions(arrays: TransactionResponse[][]): TransactionResponse[] {
  const seen = new Set<string>();
  const out: TransactionResponse[] = [];
  for (const arr of arrays) {
    for (const tx of arr) {
      const key = `${tx.transaction_date}|${tx.amount}|${tx.transaction_type}|${tx.sender_id ?? ""}|${tx.receiver_id ?? ""}|${tx.sender_name ?? ""}|${tx.receiver_name ?? ""}|${tx.comment ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(tx);
    }
  }
  return out;
}

function groupByCurrency(
  txs: TransactionResponse[]
): Partial<Record<Currency, TransactionResponse[]>> {
  const m: Partial<Record<Currency, TransactionResponse[]>> = {};
  for (const tx of txs) {
    if (!m[tx.currency]) m[tx.currency] = [];
    m[tx.currency]!.push(tx);
  }
  return m;
}

export type CurrencySummaryBlock = {
  currency: Currency;
  dayBars: DayBar[];
  categorySlices: SpendingSlice[];
};

/** Сводка по всем счетам, сгруппированная по валюте (без дублей переводов между своими счетами). */
export function buildAllAccountsSummaryBlocks(
  txsByAccount: TransactionResponse[][],
  dayKeys: string[],
  categoryNames: Map<string, string>
): CurrencySummaryBlock[] {
  const merged = mergeUniqueTransactions(txsByAccount);
  const inWin = filterInUtcDaySet(merged, dayKeys);
  const byCur = groupByCurrency(inWin);
  return (Object.keys(byCur) as Currency[])
    .sort()
    .map((currency) => {
      const txsCur = byCur[currency] ?? [];
      return {
        currency,
        dayBars: aggregateSpendingByDay(dayKeys, txsCur),
        categorySlices: aggregateByCategorySorted(txsCur, categoryNames),
      };
    });
}

export function buildAccountChartData(
  txs: TransactionResponse[],
  _accountId: string,
  dayKeys: string[],
  categoryNames: Map<string, string>
): { dayBars: DayBar[]; categorySlices: SpendingSlice[] } {
  // txs уже из getRecent по счёту; повторная фильтрация по sender/receiver обнуляет данные.
  const inWin = filterInUtcDaySet(txs, dayKeys);
  return {
    dayBars: aggregateSpendingByDay(dayKeys, inWin),
    categorySlices: aggregateByCategorySorted(inWin, categoryNames),
  };
}
