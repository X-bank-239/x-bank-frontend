"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { OpenSavingsDepositDialog } from "@/components/dashboard";
import { savingsApi } from "@/lib/api";
import type { Currency, SavingsAccount } from "@/types";
import { Button, Card, CardContent } from "@/components/ui";
import {
  formatCurrency,
  formatSavingsInterestRateText,
  getAccountCardAccent,
  getAccountTypeName,
  getSavingsStatusLabel,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function SavingsPage() {
  const { user, refreshUser } = useAuth();

  const savingsBankAccounts = useMemo(
    () => (user?.accounts ?? []).filter((a) => a.account_type === "SAVINGS"),
    [user?.accounts]
  );

  const debitAccounts = useMemo(
    () => (user?.accounts ?? []).filter((a) => a.account_type === "DEBIT"),
    [user]
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingsByAccountId, setSavingsByAccountId] = useState<Map<string, SavingsAccount>>(
    () => new Map()
  );
  const [depositTarget, setDepositTarget] = useState<{
    accountId: string;
    currency: Currency;
    balance: number;
  } | null>(null);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    } finally {
      setBusy(false);
    }
  }, []);

  const loadSavings = useCallback(async (options?: { notify?: boolean }) => {
    setBusy(true);
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const accounts = await savingsApi.getAll();
      const map = new Map<string, SavingsAccount>();
      for (const s of accounts) map.set(s.accountId, s);
      setSavingsByAccountId(map);
      if (options?.notify) setMessage("Данные обновлены.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSavings();
  }, [loadSavings]);

  const items = useMemo(() => {
    return savingsBankAccounts.map((account) => ({
      account,
      savings: savingsByAccountId.get(account.account_id),
    }));
  }, [savingsBankAccounts, savingsByAccountId]);

  const pendingDepositCount = useMemo(
    () => items.filter((i) => !i.savings).length,
    [items]
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Накопительные счета
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Сначала откройте накопительный счёт на главной или в «Мои счета», затем оформите
            вклад здесь.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/accounts"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Создать счёт
          </Link>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void loadSavings({ notify: true })}
          >
            Обновить
          </Button>
        </div>
      </div>

      {depositTarget && (
        <OpenSavingsDepositDialog
          open
          onClose={() => setDepositTarget(null)}
          onCreated={async () => {
            await refreshUser();
            await loadSavings({ notify: true });
          }}
          accountId={depositTarget.accountId}
          currency={depositTarget.currency}
          balance={depositTarget.balance}
        />
      )}

      {pendingDepositCount > 0 && (
        <p className="text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
          {pendingDepositCount === 1
            ? "Есть счёт без вклада — нажмите «Оформить вклад»."
            : `Счетов без вклада: ${pendingDepositCount}. Оформите вклад на каждый.`}
        </p>
      )}

      {(error || message) && (
        <div
          className={
            error
              ? "p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm"
              : "p-4 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 text-sm"
          }
        >
          {error || message}
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            Загрузка…
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-slate-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Накопительных счетов нет
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-sm">
              Создайте накопительный счёт (тип «Накопительный»), затем вернитесь сюда и
              оформите вклад.
            </p>
            <Link
              href="/dashboard/accounts"
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              Создать накопительный счёт
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {items.map(({ account, savings }) => (
            <SavingsAccountPanel
              key={account.account_id}
              accountId={account.account_id}
              currency={account.currency}
              balance={account.balance}
              savings={savings}
              debitAccounts={debitAccounts}
              busy={busy}
              onRun={run}
              onReload={loadSavings}
              onRefreshUser={refreshUser}
              onMessage={setMessage}
              onOpenDeposit={() =>
                setDepositTarget({
                  accountId: account.account_id,
                  currency: account.currency,
                  balance: account.balance,
                })
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SavingsAccountPanel({
  accountId,
  currency,
  balance,
  savings,
  debitAccounts,
  busy,
  onRun,
  onReload,
  onRefreshUser,
  onMessage,
  onOpenDeposit,
}: {
  accountId: string;
  currency: Currency;
  balance: number;
  savings?: SavingsAccount;
  debitAccounts: { account_id: string; currency: Currency; balance: number }[];
  busy: boolean;
  onRun: (fn: () => Promise<void>) => Promise<void>;
  onReload: (options?: { notify?: boolean }) => void;
  onRefreshUser: () => Promise<void>;
  onMessage: (s: string) => void;
  onOpenDeposit: () => void;
}) {
  const [prolongDate, setProlongDate] = useState(savings?.maturityDate ?? "");
  const [closeTargetId, setCloseTargetId] = useState(debitAccounts[0]?.account_id ?? "");
  const accentBar = getAccountCardAccent(currency);

  useEffect(() => {
    if (savings?.maturityDate) setProlongDate(savings.maturityDate);
  }, [savings?.maturityDate]);

  useEffect(() => {
    if (debitAccounts.length && !debitAccounts.some((a) => a.account_id === closeTargetId)) {
      setCloseTargetId(debitAccounts[0]!.account_id);
    }
  }, [debitAccounts, closeTargetId]);

  const canManage = Boolean(savings);

  return (
    <li className="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className={cn("w-1 shrink-0", accentBar)} />
      <div className="flex-1 min-w-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {getAccountTypeName("SAVINGS")} · {currency}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all mt-1">
                {accountId}
              </p>
            </div>
            {savings ? (
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                {getSavingsStatusLabel(savings.status)}
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(balance, currency)}
          </p>

          {savings ? (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              {Number.isFinite(savings.interestRate) && savings.interestRate > 0 ? (
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {formatSavingsInterestRateText(savings.interestRate)}
                </span>
              ) : null}
              <span>До {savings.maturityDate}</span>
              <span>
                Начислено: {formatCurrency(savings.accruedInterest, currency)}
              </span>
              {savings.autoProlong ? <span>Автопролонг</span> : null}
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Вклад не оформлен — только счёт.
              </p>
              <Button size="sm" onClick={onOpenDeposit}>
                Оформить вклад
              </Button>
            </div>
          )}
        </div>

        {canManage && savings ? (
          <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/30 space-y-4">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Управление
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs text-slate-600 dark:text-slate-400">
                  Продлить до даты
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    value={prolongDate}
                    onChange={(e) => setProlongDate(e.target.value)}
                    className="flex-1 min-w-[10rem] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || !prolongDate}
                    onClick={() =>
                      onRun(async () => {
                        await savingsApi.prolong(savings.accountId, {
                          new_maturity_date: prolongDate,
                        });
                        onReload();
                        await onRefreshUser();
                        onMessage("Срок вклада продлён.");
                      })
                    }
                  >
                    Продлить
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-600 dark:text-slate-400">
                  Закрыть и перевести на счёт
                </label>
                <div className="flex flex-wrap gap-2">
                  {debitAccounts.length > 0 ? (
                    <select
                      value={closeTargetId}
                      onChange={(e) => setCloseTargetId(e.target.value)}
                      className="flex-1 min-w-[10rem] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    >
                      {debitAccounts.map((a) => (
                        <option key={a.account_id} value={a.account_id}>
                          {a.currency} · {formatCurrency(a.balance, a.currency)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-slate-500 py-2">
                      Нужен дебетовый счёт для зачисления
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-800 hover:bg-red-50 dark:border-red-900 dark:text-red-300 shrink-0"
                    disabled={busy || !closeTargetId}
                    onClick={() => {
                      if (!confirm("Закрыть накопительный счёт и перевести средства?")) return;
                      void onRun(async () => {
                        await savingsApi.close(savings.accountId, {
                          target_account_id: closeTargetId,
                        });
                        onReload();
                        await onRefreshUser();
                        onMessage("Счёт закрыт.");
                      });
                    }}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
