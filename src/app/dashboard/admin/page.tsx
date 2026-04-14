"use client";

import { useState } from "react";
import { AdminRoute } from "@/components/AdminRoute";
import { adminApi } from "@/lib/api";
import type { BankAccountResponse, TransactionResponse, UserProfileResponse } from "@/types";
import { OPENAPI_SPEC_URL, SWAGGER_UI_URL } from "@/lib/swagger";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

export default function AdminPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [userAccounts, setUserAccounts] = useState<BankAccountResponse[] | null>(null);
  const [bankListUserId, setBankListUserId] = useState("");
  const [bankList, setBankList] = useState<BankAccountResponse[] | null>(null);
  const [accountId, setAccountId] = useState("");
  const [singleAccount, setSingleAccount] = useState<BankAccountResponse | null>(null);
  const [txId, setTxId] = useState("");
  const [tx, setTx] = useState<TransactionResponse | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminRoute>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Админ</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Операции по OpenAPI для роли ADMIN.
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

        <Card>
          <CardHeader>
            <CardTitle>Документация API</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 text-sm">
            <a
              href={SWAGGER_UI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Swagger UI
            </a>
            <a
              href={OPENAPI_SPEC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              OpenAPI JSON
            </a>
          </CardContent>
        </Card>

        <Card accent>
          <CardHeader>
            <CardTitle>Пользователь по UUID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value.trim())}
                placeholder="user UUID"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              />
              <Button
                variant="outline"
                disabled={busy || !userId}
                onClick={() =>
                  run(async () => {
                    const p = await adminApi.getUserProfile(userId);
                    setProfile(p);
                    setMessage("Профиль загружен.");
                  })
                }
              >
                Профиль
              </Button>
              <Button
                variant="outline"
                disabled={busy || !userId}
                onClick={() =>
                  run(async () => {
                    const list = await adminApi.getUserAccounts(userId);
                    setUserAccounts(list);
                    setMessage("Счета пользователя загружены.");
                  })
                }
              >
                Счета (user/get-accounts)
              </Button>
              <Button
                variant="outline"
                disabled={busy || !userId}
                onClick={() => {
                  if (!confirm(`Заблокировать пользователя ${userId}?`)) return;
                  run(async () => {
                    await adminApi.blockUser(userId);
                    setMessage("Пользователь заблокирован.");
                  });
                }}
              >
                Блокировать
              </Button>
            </div>
            {profile && (
              <pre className="text-xs overflow-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 max-h-48">
                {JSON.stringify(profile, null, 2)}
              </pre>
            )}
            {userAccounts && (
              <ul className="text-sm space-y-1">
                {userAccounts.map((a) => (
                  <li key={a.account_id} className="font-mono text-xs">
                    {a.account_id} · {a.account_type} · {formatCurrency(a.balance, a.currency)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Пользователь по email</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="email"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <Button
              variant="outline"
              disabled={busy || !email}
              onClick={() =>
                run(async () => {
                  const p = await adminApi.getUserProfileByEmail(email);
                  setProfile(p);
                  setMessage("Профиль по email загружен.");
                })
              }
            >
              Загрузить
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Счета по userId (bank-account/list)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <input
                value={bankListUserId}
                onChange={(e) => setBankListUserId(e.target.value.trim())}
                placeholder="user UUID"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              />
              <Button
                variant="outline"
                disabled={busy || !bankListUserId}
                onClick={() =>
                  run(async () => {
                    const list = await adminApi.getBankAccountsByUserId(bankListUserId);
                    setBankList(list);
                    setMessage("Список счетов загружен.");
                  })
                }
              >
                Загрузить
              </Button>
            </div>
            {bankList && (
              <ul className="text-sm space-y-1">
                {bankList.map((a) => (
                  <li key={a.account_id} className="font-mono text-xs">
                    {a.account_id} · {formatCurrency(a.balance, a.currency)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Счёт по accountId</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <input
                value={accountId}
                onChange={(e) => setAccountId(e.target.value.trim())}
                placeholder="account UUID"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              />
              <Button
                variant="outline"
                disabled={busy || !accountId}
                onClick={() =>
                  run(async () => {
                    const a = await adminApi.getBankAccount(accountId);
                    setSingleAccount(a);
                    setMessage("Счёт загружен.");
                  })
                }
              >
                Загрузить
              </Button>
            </div>
            {singleAccount && (
              <pre className="text-xs overflow-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                {JSON.stringify(singleAccount, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Транзакция</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <input
                value={txId}
                onChange={(e) => setTxId(e.target.value.trim())}
                placeholder="transaction UUID"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
              />
              <Button
                variant="outline"
                disabled={busy || !txId}
                onClick={() =>
                  run(async () => {
                    const t = await adminApi.getTransaction(txId);
                    setTx(t);
                    setMessage("Транзакция загружена.");
                  })
                }
              >
                Загрузить
              </Button>
              <Button
                variant="outline"
                disabled={busy || !txId}
                onClick={() => {
                  if (!confirm("Отменить транзакцию?")) return;
                  run(async () => {
                    await adminApi.cancelTransaction(txId);
                    setMessage("Запрос на отмену отправлен.");
                  });
                }}
              >
                Отменить
              </Button>
            </div>
            {tx && (
              <pre className="text-xs overflow-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 max-h-56">
                {JSON.stringify(tx, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminRoute>
  );
}
