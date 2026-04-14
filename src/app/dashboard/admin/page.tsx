"use client";

import { useState } from "react";
import { AdminRoute } from "@/components/AdminRoute";
import { adminApi } from "@/lib/api";
import type { BankAccountResponse, TransactionResponse, UserProfileResponse } from "@/types";
import { OPENAPI_SPEC_URL, SWAGGER_UI_URL } from "@/lib/swagger";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

function AdminSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function UserProfileCard({ profile }: { profile: UserProfileResponse }) {
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const role = profile.role ?? (profile.is_admin ? "ADMIN" : "USER");
  const isActive = profile.active !== false;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
            {fullName || "Без имени"}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{profile.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-1 rounded-md text-[11px] font-medium border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30">
            {role}
          </span>
          <span
            className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
              isActive
                ? "border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30"
                : "border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30"
            }`}
          >
            {isActive ? "Активен" : "Заблокирован"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
          <p className="text-slate-500 dark:text-slate-400">UUID</p>
          <p className="font-mono text-slate-800 dark:text-slate-100 break-all">{profile.user_id}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
          <p className="text-slate-500 dark:text-slate-400">Дата рождения</p>
          <p className="text-slate-800 dark:text-slate-100 break-all">{profile.birthdate}</p>
        </div>
      </div>
    </div>
  );
}

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

        <AdminSection
          title="Users"
          subtitle="Поиск профиля, просмотр счетов и управление блокировкой пользователя."
        >
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
                <UserProfileCard profile={profile} />
              )}
              {userAccounts && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Счета пользователя
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {userAccounts.map((a) => (
                      <div
                        key={a.account_id}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                      >
                        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 break-all">
                          {a.account_id}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-600 dark:text-slate-300">{a.account_type}</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(a.balance, a.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
        </AdminSection>

        <AdminSection
          title="Accounts"
          subtitle="Операции просмотра счетов пользователя и конкретного счета."
        >
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
        </AdminSection>

        <AdminSection
          title="Transactions"
          subtitle="Просмотр и отмена транзакций."
        >
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
        </AdminSection>

        <AdminSection
          title="API"
          subtitle="Быстрые ссылки на документацию и OpenAPI спецификацию."
        >
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
        </AdminSection>
      </div>
    </AdminRoute>
  );
}
