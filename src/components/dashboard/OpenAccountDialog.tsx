"use client";

import { useEffect, useState } from "react";
import { accountsApi } from "@/lib/api";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Currency, AccountType } from "@/types";
import { getAccountTypeName, getCurrencyName } from "@/lib/utils";

const currencies: Currency[] = ["RUB", "USD", "EUR", "CNY"];
const accountTypes: AccountType[] = ["DEBIT", "CREDIT", "SAVINGS"];

type OpenAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
};

export function OpenAccountDialog({ open, onClose, onCreated }: OpenAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAccount, setNewAccount] = useState<{
    currency: Currency;
    account_type: AccountType;
  }>({
    currency: "RUB",
    account_type: "DEBIT",
  });

  useEffect(() => {
    if (!open) return;
    setError("");
    setNewAccount({ currency: "RUB", account_type: "DEBIT" });
  }, [open]);

  if (!open) return null;

  const isSavings = newAccount.account_type === "SAVINGS";

  const handleCreate = async () => {
    setIsLoading(true);
    setError("");
    try {
      await accountsApi.create({
        currency: newAccount.currency,
        account_type: newAccount.account_type,
      });

      await onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания счёта");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Открыть новый счёт</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Тип
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {accountTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewAccount((prev) => ({ ...prev, account_type: type }))}
                    className={`px-3 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      newAccount.account_type === type
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {getAccountTypeName(type)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Валюта
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currencies.map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => setNewAccount((prev) => ({ ...prev, currency }))}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      newAccount.currency === currency
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {getCurrencyName(newAccount.currency)}
              </p>
            </div>

            {isSavings && (
              <p className="text-sm text-slate-600 dark:text-slate-300 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/80 dark:bg-teal-900/20 px-3 py-2">
                Счёт будет создан. Вклад оформите в разделе «Накопительные».
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Отмена
              </Button>
              <Button className="flex-1" onClick={() => void handleCreate()} disabled={isLoading}>
                {isLoading ? "Создание..." : "Создать"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
