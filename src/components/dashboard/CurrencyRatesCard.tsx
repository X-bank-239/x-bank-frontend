"use client";

import { useEffect, useState } from "react";
import { cbrApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Currency, CurrencyRate } from "@/types";

const DISPLAY_ORDER: Currency[] = ["USD", "EUR", "CNY"];

function formatRubPerUnit(rate: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(rate);
}

export function CurrencyRatesCard() {
  const [rates, setRates] = useState<CurrencyRate[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    cbrApi
      .getLatestRates()
      .then((data) => {
        if (!cancelled) setRates(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Не удалось загрузить курсы");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ratesDate = rates?.[0]?.date;
  const byCurrency = new Map((rates ?? []).map((r) => [r.currency, r.rate]));

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Курсы валют ЦБ</CardTitle>
        {ratesDate && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            на {ratesDate}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0 pb-5">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Загрузка…</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DISPLAY_ORDER.map((currency) => {
              const rub = byCurrency.get(currency);
              return (
                <li
                  key={currency}
                  className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 px-3 py-2.5"
                >
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{currency}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {typeof rub === "number" ? (
                      <>
                        1 {currency} = {formatRubPerUnit(rub)} ₽
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
