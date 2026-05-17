"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { savingsApi } from "@/lib/api";
import type { CreateSavingsAccountRequest, SavingsAccount } from "@/types";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency, getSavingsStatusLabel } from "@/lib/utils";

function defaultMaturityDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export default function SavingsPage() {
  const { user, refreshUser } = useAuth();
  const debitAccounts = useMemo(
    () => (user?.accounts ?? []).filter((a) => a.account_type === "DEBIT"),
    [user]
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<SavingsAccount[]>([]);
  const [interestRate, setInterestRate] = useState<number | null>(null);

  const [accountId, setAccountId] = useState("");
  const [maturityDate, setMaturityDate] = useState(defaultMaturityDate);
  const [allowWithdrawal, setAllowWithdrawal] = useState(true);
  const [allowTopUp, setAllowTopUp] = useState(true);

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

  const loadAll = useCallback(async () => {
    setBusy(true);
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const accounts = await savingsApi.getAll();
      setList(accounts);
      try {
        const rate = await savingsApi.getInterest();
        setInterestRate(rate);
      } catch {
        setInterestRate(null);
      }
      setMessage("Данные обновлены.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (debitAccounts.length === 0) return;
    if (!accountId || !debitAccounts.some((a) => a.account_id === accountId)) {
      setAccountId(debitAccounts[0]!.account_id);
    }
  }, [debitAccounts, accountId]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Вклады</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Накопительные счета: ставка по вкладам, открытие, продление и закрытие.
        </p>
      </div>

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

      <Card accent>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Ставка по вкладам</CardTitle>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => loadAll()}>
            Обновить всё
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Загрузка…</p>
          ) : interestRate !== null ? (
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {interestRate}% годовых
            </p>
          ) : null}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Текущая процентная ставка по вкладам</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Открыть вклад</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {debitAccounts.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Нужен дебетовый счёт —{" "}
              <Link href="/dashboard/accounts" className="font-medium text-primary-600 dark:text-primary-400 underline">
                откройте счёт
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Дебетовый счёт
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    {debitAccounts.map((a) => (
                      <option key={a.account_id} value={a.account_id}>
                        {a.currency} · {formatCurrency(a.balance, a.currency)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Дата окончания вклада
                  </label>
                  <input
                    type="date"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={allowWithdrawal}
                    onChange={(e) => setAllowWithdrawal(e.target.checked)}
                  />
                  Разрешить снятие со вклада
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={allowTopUp}
                    onChange={(e) => setAllowTopUp(e.target.checked)}
                  />
                  Разрешить пополнение вклада
                </label>
              </div>
              <Button
                disabled={busy || !accountId || !maturityDate}
                onClick={() =>
                  run(async () => {
                    const body: CreateSavingsAccountRequest = {
                      account_id: accountId,
                      maturity_date: maturityDate,
                      allow_withdrawal: allowWithdrawal,
                      allow_top_up: allowTopUp,
                    };
                    await savingsApi.create(body);
                    await refreshUser();
                    await loadAll();
                    setMessage("Вклад открыт.");
                  })
                }
              >
                Открыть вклад
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Мои вклады</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && !list.length ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Нет вкладов или список пуст.</p>
          ) : !loading ? (
            <ul className="space-y-4">
              {list.map((s) => (
                <SavingsRow
                  key={s.accountId}
                  savings={s}
                  debitAccounts={debitAccounts}
                  busy={busy}
                  onRun={run}
                  onReload={loadAll}
                  onRefreshUser={refreshUser}
                  onMessage={setMessage}
                />
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function SavingsRow({
  savings,
  debitAccounts,
  busy,
  onRun,
  onReload,
  onRefreshUser,
  onMessage,
}: {
  savings: SavingsAccount;
  debitAccounts: { account_id: string; currency: string; balance: number }[];
  busy: boolean;
  onRun: (fn: () => Promise<void>) => Promise<void>;
  onReload: () => void;
  onRefreshUser: () => Promise<void>;
  onMessage: (s: string) => void;
}) {
  const [prolongDate, setProlongDate] = useState(savings.maturityDate);
  const [closeTargetId, setCloseTargetId] = useState(debitAccounts[0]?.account_id ?? "");

  useEffect(() => {
    setProlongDate(savings.maturityDate);
  }, [savings.maturityDate]);

  useEffect(() => {
    if (debitAccounts.length && !debitAccounts.some((a) => a.account_id === closeTargetId)) {
      setCloseTargetId(debitAccounts[0]!.account_id);
    }
  }, [debitAccounts, closeTargetId]);

  return (
    <li className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 text-sm">
      <div className="flex flex-wrap justify-between gap-2">
        <span className="font-mono text-xs text-slate-500 break-all">{savings.accountId}</span>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {getSavingsStatusLabel(savings.status)}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
        <div>Начислено: {savings.accruedInterest}</div>
        <div>Ставка: {savings.interestRate}%</div>
        <div>Окончание: {savings.maturityDate}</div>
        <div>Автопролонг: {savings.autoProlong ? "да" : "нет"}</div>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-end gap-2">
          <input
            type="date"
            value={prolongDate}
            onChange={(e) => setProlongDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !prolongDate}
            onClick={() =>
              onRun(async () => {
                await savingsApi.prolong(savings.accountId, { new_maturity_date: prolongDate });
                onReload();
                await onRefreshUser();
                onMessage("Вклад продлён.");
              })
            }
          >
            Продлить
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={closeTargetId}
            onChange={(e) => setCloseTargetId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs max-w-full"
            disabled={!debitAccounts.length}
          >
            {debitAccounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                Зачислить на {a.account_id.slice(0, 8)}…
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-800 hover:bg-red-50 dark:border-red-900 dark:text-red-300"
            disabled={busy || !closeTargetId}
            onClick={() => {
              if (!confirm("Закрыть вклад и перевести средства на выбранный счёт?")) return;
              void onRun(async () => {
                await savingsApi.close(savings.accountId, { target_account_id: closeTargetId });
                onReload();
                await onRefreshUser();
                onMessage("Вклад закрыт.");
              });
            }}
          >
            Закрыть
          </Button>
        </div>
      </div>
    </li>
  );
}
