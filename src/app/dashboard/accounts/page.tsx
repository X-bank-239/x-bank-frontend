"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { accountsApi } from "@/lib/api";
import { AccountCard } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { Currency, AccountType } from "@/types";
import { getCurrencyName, getAccountTypeName } from "@/lib/utils";

const currencies: Currency[] = ["RUB", "USD", "EUR", "CNY"];
const accountTypes: AccountType[] = ["DEBIT", "CREDIT"];

export default function AccountsPage() {
  const { user, refreshUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAccount, setNewAccount] = useState<{
    currency: Currency;
    account_type: AccountType;
  }>({
    currency: "RUB",
    account_type: "DEBIT",
  });

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError("");

    try {
      await accountsApi.create(newAccount);
      await refreshUser();
      setIsCreating(false);
      setNewAccount({ currency: "RUB", account_type: "DEBIT" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания счёта");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Мои счета</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Управление банковскими счетами</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Открыть счёт
        </Button>
      </div>

      {isCreating && (
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Тип счёта
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {accountTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewAccount((prev) => ({ ...prev, account_type: type }))}
                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all text-sm ${
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

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCreating(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreateAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? "Создание..." : "Создать"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.accounts && user.accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.accounts.map((account) => (
            <AccountCard key={account.account_id} account={account} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-slate-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
              У вас пока нет счетов
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-sm">
              Откройте первый счёт в одной из доступных валют
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Открыть первый счёт
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card accent>
          <CardContent className="flex items-start gap-4 pt-5 pb-5">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Дебетовый счёт</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Хранение и расход собственных средств. Подходит для повседневных операций.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-4 pt-5 pb-5">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Кредитный счёт</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Доступ к заёмным средствам с гибкими условиями погашения.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
