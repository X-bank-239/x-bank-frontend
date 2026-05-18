"use client";

import { useCallback, useEffect, useState } from "react";
import { savingsApi } from "@/lib/api";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Currency } from "@/types";
import {
  formatCurrency,
  getSavingsInterestVariantLabel,
  SAVINGS_INTEREST_VARIANTS,
} from "@/lib/utils";

function defaultMaturityDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function interestKey(allowWithdrawal: boolean, allowTopUp: boolean): string {
  return `${allowWithdrawal}:${allowTopUp}`;
}

type OpenSavingsDepositDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
  accountId: string;
  currency: Currency;
  balance?: number;
};

export function OpenSavingsDepositDialog({
  open,
  onClose,
  onCreated,
  accountId,
  currency,
  balance,
}: OpenSavingsDepositDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [maturityDate, setMaturityDate] = useState(defaultMaturityDate);
  const [allowWithdrawal, setAllowWithdrawal] = useState(true);
  const [allowTopUp, setAllowTopUp] = useState(true);
  const [interestRates, setInterestRates] = useState<Record<string, number>>({});

  const selectedRate = interestRates[interestKey(allowWithdrawal, allowTopUp)];

  const loadInterestRates = useCallback(async () => {
    const entries = await Promise.all(
      SAVINGS_INTEREST_VARIANTS.map(async (variant) => {
        const rate = await savingsApi.getInterest(variant);
        return [interestKey(variant.allowWithdrawal, variant.allowTopUp), rate] as const;
      })
    );
    setInterestRates(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    if (!open) return;
    setError("");
    setMaturityDate(defaultMaturityDate());
    setAllowWithdrawal(true);
    setAllowTopUp(true);
    void loadInterestRates().catch(() => setInterestRates({}));
  }, [open, loadInterestRates]);

  if (!open) return null;

  const handleCreate = async () => {
    setIsLoading(true);
    setError("");
    try {
      await savingsApi.create({
        account_id: accountId,
        maturity_date: maturityDate,
        allow_withdrawal: allowWithdrawal,
        allow_top_up: allowTopUp,
      });

      await onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось оформить вклад.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Оформить вклад</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-normal mt-1">
            Вклад открывается на уже созданный накопительный счёт.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-3 text-sm">
              <p className="text-slate-600 dark:text-slate-300">
                Счёт · <span className="font-medium">{currency}</span>
                {typeof balance === "number" ? (
                  <>
                    {" "}
                    · баланс{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {formatCurrency(balance, currency)}
                    </span>
                  </>
                ) : null}
              </p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1 break-all">
                {accountId}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Дата окончания
              </label>
              <input
                type="date"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/80 dark:bg-slate-800/40">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allowWithdrawal}
                  onChange={(e) => setAllowWithdrawal(e.target.checked)}
                />
                Разрешить снятие
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={allowTopUp}
                  onChange={(e) => setAllowTopUp(e.target.checked)}
                />
                Разрешить пополнение
              </label>
              {typeof selectedRate === "number" && (
                <p className="text-sm text-slate-600 dark:text-slate-300 pt-1">
                  Ставка:{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {selectedRate}% годовых
                  </span>{" "}
                  ({getSavingsInterestVariantLabel(allowWithdrawal, allowTopUp)})
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Отмена
              </Button>
              <Button
                className="flex-1"
                onClick={() => void handleCreate()}
                disabled={isLoading || !maturityDate}
              >
                {isLoading ? "Оформление…" : "Оформить вклад"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
