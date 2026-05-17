"use client";

import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/types";
import type { DayBar, SpendingSlice } from "@/lib/spending-charts";

const PIE_COLORS = [
  "#0ea5e9",
  "#14b8a6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#22c55e",
  "#6366f1",
];

function conicGradientForSlices(slices: SpendingSlice[], colors: string[]): string {
  const total = slices.reduce((s, x) => s + x.amount, 0);
  if (total <= 0 || slices.length === 0) return "conic-gradient(#e2e8f0 0% 100%)";
  let offset = 0;
  const parts = slices.map((item, index) => {
    const from = offset;
    const slice = (item.amount / total) * 100;
    offset += slice;
    const color = colors[index % colors.length];
    return `${color} ${from}% ${offset}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

export function SpendingChartsPanel({
  title,
  subtitle,
  currency,
  dayBars,
  categorySlices,
}: {
  title: string;
  subtitle?: string;
  currency: Currency;
  dayBars: DayBar[];
  categorySlices: SpendingSlice[];
}) {
  const categoryTotal = categorySlices.reduce((s, i) => s + i.amount, 0);
  const pieBg = conicGradientForSlices(categorySlices, PIE_COLORS);
  const hasPie = categorySlices.length > 0 && categoryTotal > 0;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{title}</p>
        {subtitle ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        ) : null}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          Операции по дням (последние 7 календарных дней)
        </p>
        <div className="grid grid-cols-7 gap-1.5 h-32">
          {dayBars.map((d) => (
            <div key={d.dateKey} className="flex flex-col h-full min-h-0">
              <div className="flex flex-1 min-h-0 flex-col justify-end">
                <div
                  className="mx-auto w-[80%] max-w-[2.25rem] rounded-t bg-primary-500"
                  style={{
                    height: `${d.barPercent}%`,
                    minHeight: d.amount > 0 ? 4 : 0,
                  }}
                  title={`${d.label}: ${formatCurrency(d.amount, currency)}`}
                />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1 truncate">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
          По категориям (сортировка по сумме, по убыванию)
        </p>
        {hasPie ? (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-center">
            <div className="flex items-center justify-center">
              <div
                className="relative h-44 w-44 rounded-full"
                style={{ background: pieBg }}
                aria-label="Круговая диаграмма операций по категориям"
              >
                <div className="absolute inset-7 rounded-full bg-white dark:bg-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Всего</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency(categoryTotal, currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {categorySlices.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-300 truncate">{item.label}</span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Нет операций за выбранные 7 дней.
          </p>
        )}
      </div>
    </div>
  );
}
