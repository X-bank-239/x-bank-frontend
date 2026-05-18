"use client";

import { useMemo, useState } from "react";
import { AdminRoute } from "@/components/AdminRoute";
import { adminApi, cbrApi, categoriesApi, keywordsApi, settingsApi, transactionsApi } from "@/lib/api";
import type {
  AppSetting,
  BankAccountResponse,
  Currency,
  CurrencyRate,
  TransactionCategory,
  TransactionKeyword,
  TransactionResponse,
  UserProfileResponse,
} from "@/types";
import { OPENAPI_SPEC_URL, SWAGGER_UI_URL } from "@/lib/swagger";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCurrency, getTransactionStatusLabel, getTransactionTypeName, getUserRoleLabel, getAccountTypeName } from "@/lib/utils";

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

function formatBirthdate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
        active
          ? "border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30"
          : "border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30"
      }`}
    >
      {active ? "Активен" : "Заблокирован"}
    </span>
  );
}

function UserProfileCard({ profile }: { profile: UserProfileResponse }) {
  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const role = profile.role ?? "USER";
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
            {getUserRoleLabel(role)}
          </span>
          <ActiveBadge active={isActive} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
          <p className="text-slate-500 dark:text-slate-400">UUID</p>
          <p className="font-mono text-slate-800 dark:text-slate-100 break-all">{profile.user_id}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
          <p className="text-slate-500 dark:text-slate-400">Дата рождения</p>
          <p className="text-slate-800 dark:text-slate-100 break-all">
            {formatBirthdate(profile.birthdate)}
          </p>
        </div>
      </div>
    </div>
  );
}

function AccountCardAdmin({ account }: { account: BankAccountResponse }) {
  const isActive = account.active !== false;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {getAccountTypeName(account.account_type)} · {account.currency}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 break-all">
            {account.account_id}
          </p>
        </div>
        <ActiveBadge active={isActive} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">Баланс</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(account.balance, account.currency)}
        </p>
      </div>
    </div>
  );
}

function TransactionCardAdmin({ tx }: { tx: TransactionResponse }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {getTransactionTypeName(tx.transaction_type)} · {formatCurrency(tx.amount, tx.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Дата: {formatDateTime(tx.transaction_date)}
          </p>
        </div>
        {tx.status && (
          <span className="px-2 py-1 rounded-md text-[11px] font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">
            {getTransactionStatusLabel(tx.status)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-2">
          <p className="text-slate-500 dark:text-slate-400">Отправитель</p>
          <p className="text-slate-800 dark:text-slate-100 break-all">
            {tx.sender_name ?? tx.sender_id ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-2">
          <p className="text-slate-500 dark:text-slate-400">Получатель</p>
          <p className="text-slate-800 dark:text-slate-100 break-all">
            {tx.receiver_name ?? tx.receiver_id ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-2">
          <p className="text-slate-500 dark:text-slate-400">Категория</p>
          <p className="text-slate-800 dark:text-slate-100 break-all">{tx.category ?? "—"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-2">
          <p className="text-slate-500 dark:text-slate-400">Комментарий</p>
          <p className="text-slate-800 dark:text-slate-100 break-all">{tx.comment ?? "—"}</p>
        </div>
      </div>
      {typeof tx.commission === "number" && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Комиссия: {formatCurrency(tx.commission, tx.currency)}
        </p>
      )}
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
  const [depositAccountId, setDepositAccountId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositComment, setDepositComment] = useState("");
  const [txId, setTxId] = useState("");
  const [tx, setTx] = useState<TransactionResponse | null>(null);

  // Categories
  const [categories, setCategories] = useState<TransactionCategory[] | null>(null);
  const [catCode, setCatCode] = useState("");
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#0d9488");

  // Keywords
  const [keywords, setKeywords] = useState<TransactionKeyword[] | null>(null);
  const [kwCategory, setKwCategory] = useState("");
  const [kwWord, setKwWord] = useState("");
  const [kwNewWord, setKwNewWord] = useState("");

  // CBR / currency rates
  const [supportedCurrencies, setSupportedCurrencies] = useState<Currency[] | null>(null);
  const [latestRates, setLatestRates] = useState<CurrencyRate[] | null>(null);
  const [ratesDate, setRatesDate] = useState("");
  const [ratesByDate, setRatesByDate] = useState<CurrencyRate[] | null>(null);
  const [syncDate, setSyncDate] = useState("");

  const [settingsList, setSettingsList] = useState<AppSetting[] | null>(null);
  const [settingEdits, setSettingEdits] = useState<Record<string, { value: string; description: string }>>({});

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

  /** Профиль относится к полю UUID: либо совпадает с введённым id, либо профиль загружен только по Email (поле UUID пустое). */
  const userProfileMatchesInput =
    Boolean(profile) &&
    (userId ? profile!.user_id === userId : true);
  const userIsActive = profile ? profile.active !== false : true;

  const accountIsActive = singleAccount ? singleAccount.active !== false : true;

  const categoriesByCode = useMemo(() => {
    const map = new Map<string, TransactionCategory>();
    for (const c of categories ?? []) map.set(c.code, c);
    return map;
  }, [categories]);

  const displayedCurrencyRates = useMemo(() => {
    const raw = ratesByDate ?? latestRates;
    if (!raw) return [];
    return raw.filter(
      (r): r is CurrencyRate =>
        r != null && typeof r.currency === "string" && typeof r.rate === "number"
    );
  }, [ratesByDate, latestRates]);

  return (
    <AdminRoute>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Админ</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Операции из спецификации API для администратора.
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
          title="Пользователи"
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
                  placeholder="UUID пользователя"
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
                {userProfileMatchesInput && profile && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      const id = profile.user_id;
                      if (userIsActive) {
                        if (!confirm(`Заблокировать пользователя ${id}?`)) return;
                        run(async () => {
                          await adminApi.blockUser(id);
                          const p = await adminApi.getUserProfile(id);
                          setProfile(p);
                          setMessage("Пользователь заблокирован.");
                        });
                      } else {
                        run(async () => {
                          await adminApi.unblockUser(id);
                          const p = await adminApi.getUserProfile(id);
                          setProfile(p);
                          setMessage("Пользователь разблокирован.");
                        });
                      }
                    }}
                  >
                    {userIsActive ? "Заблокировать" : "Разблокировать"}
                  </Button>
                )}
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
                          <span className="text-xs text-slate-600 dark:text-slate-300">{getAccountTypeName(a.account_type)}</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(a.balance, a.currency)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <ActiveBadge active={a.active !== false} />
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
              <CardTitle>Пользователь по Email</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <Button
                variant="outline"
                disabled={busy || !email}
                onClick={() =>
                  run(async () => {
                    const p = await adminApi.getUserProfileByEmail(email);
                    setProfile(p);
                    setUserId(p.user_id);
                    setMessage("Профиль по Email загружен.");
                  })
                }
              >
                Загрузить
              </Button>
            </CardContent>
          </Card>
        </AdminSection>

        <AdminSection
          title="Счета"
          subtitle="Просмотр счетов, блокировка и пополнение через POST /transactions/deposit (роль ADMIN)."
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
                  placeholder="UUID пользователя"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bankList.map((a) => (
                    <AccountCardAdmin key={a.account_id} account={a} />
                  ))}
                </div>
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
                  placeholder="UUID счёта"
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
                {singleAccount && singleAccount.account_id === accountId && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      const id = singleAccount.account_id;
                      if (accountIsActive) {
                        if (!confirm(`Заблокировать счёт ${id}?`)) return;
                        run(async () => {
                          await adminApi.deactivateAccount(id);
                          const a = await adminApi.getBankAccount(id);
                          setSingleAccount(a);
                          setMessage("Счёт заблокирован.");
                        });
                      } else {
                        run(async () => {
                          await adminApi.reactivateAccount(id);
                          const a = await adminApi.getBankAccount(id);
                          setSingleAccount(a);
                          setMessage("Счёт разблокирован.");
                        });
                      }
                    }}
                  >
                    {accountIsActive ? "Заблокировать" : "Разблокировать"}
                  </Button>
                )}
              </div>
              {singleAccount && <AccountCardAdmin account={singleAccount} />}
            </CardContent>
          </Card>

          <Card accent>
            <CardHeader>
              <CardTitle>Пополнение счёта</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono">POST /transactions/deposit</span> с{" "}
                <span className="font-mono">transaction_type: DEPOSIT</span> и <span className="font-mono">receiver_id</span> — UUID
                счёта. Валюта подставляется с бэка по счёту. Доступно только администраторам.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    UUID счёта получателя
                  </label>
                  <input
                    value={depositAccountId}
                    onChange={(e) => setDepositAccountId(e.target.value.trim())}
                    placeholder="UUID счёта"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Сумма</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Комментарий (необязательно)
                  </label>
                  <input
                    value={depositComment}
                    onChange={(e) => setDepositComment(e.target.value)}
                    placeholder="Например: корректировка баланса"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>
              <Button
                disabled={busy || !depositAccountId || Number(depositAmount) <= 0}
                onClick={() => {
                  const id = depositAccountId.trim();
                  const amt = Number(depositAmount);
                  if (!id || !Number.isFinite(amt) || amt <= 0) return;
                  if (!confirm(`Пополнить счёт ${id} на ${amt}?`)) return;
                  void run(async () => {
                    const acc = await adminApi.getBankAccount(id);
                    const created = await transactionsApi.deposit({
                      transaction_type: "DEPOSIT",
                      amount: amt,
                      currency: acc.currency,
                      receiver_id: acc.account_id,
                      comment: depositComment.trim() || undefined,
                    });
                    setMessage(
                      `Пополнение выполнено: ${formatCurrency(created.amount, created.currency)} · ${created.transaction_date}${created.status ? ` · ${getTransactionStatusLabel(created.status)}` : ""}.`
                    );
                    if (singleAccount?.account_id === id) {
                      const refreshed = await adminApi.getBankAccount(id);
                      setSingleAccount(refreshed);
                    }
                    if (bankListUserId && bankList?.some((a) => a.account_id === id)) {
                      const list = await adminApi.getBankAccountsByUserId(bankListUserId);
                      setBankList(list);
                    }
                    if (userAccounts?.some((a) => a.account_id === id) && profile?.user_id) {
                      const list = await adminApi.getUserAccounts(profile.user_id);
                      setUserAccounts(list);
                    }
                  });
                }}
              >
                Пополнить счёт
              </Button>
            </CardContent>
          </Card>
        </AdminSection>

        <AdminSection
          title="Транзакции"
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
                  placeholder="UUID транзакции"
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
              {tx && <TransactionCardAdmin tx={tx} />}
            </CardContent>
          </Card>
        </AdminSection>

        <AdminSection
          title="Категории"
          subtitle="Категории транзакций (создать/обновить/удалить/список)."
        >
          <Card>
            <CardHeader>
              <CardTitle>Категории</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const data = await categoriesApi.getAll();
                      setCategories(data);
                      setMessage("Категории загружены.");
                    })
                  }
                >
                  Обновить список
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value.trim())}
                  placeholder="Код (например: FOOD)"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                />
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Название"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
                <input
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  placeholder="Цвет (например: #0d9488)"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || !catCode || !catName || !catColor}
                  onClick={() =>
                    run(async () => {
                      await categoriesApi.create({
                        code: catCode,
                        display_name: catName,
                        color_code: catColor,
                      });
                      const data = await categoriesApi.getAll();
                      setCategories(data);
                      setMessage("Категория создана.");
                    })
                  }
                >
                  Создать
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !catCode}
                  onClick={() =>
                    run(async () => {
                      const existing = categoriesByCode.get(catCode);
                      await categoriesApi.update(catCode, {
                        display_name: catName || existing?.display_name,
                        color_code: catColor || existing?.color_code,
                      });
                      const data = await categoriesApi.getAll();
                      setCategories(data);
                      setMessage("Категория обновлена.");
                    })
                  }
                >
                  Обновить
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !catCode}
                  onClick={() => {
                    if (!confirm(`Удалить категорию ${catCode}?`)) return;
                    run(async () => {
                      await categoriesApi.delete(catCode);
                      const data = await categoriesApi.getAll();
                      setCategories(data);
                      setMessage("Категория удалена.");
                    });
                  }}
                >
                  Удалить
                </Button>
              </div>

              {categories && categories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCatCode(c.code);
                        setCatName(c.display_name);
                        setCatColor(c.color_code);
                      }}
                      className="text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {c.code}
                        </span>
                        <span
                          className="h-3 w-3 rounded-full border border-slate-200 dark:border-slate-700"
                          style={{ background: c.color_code }}
                        />
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {c.display_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {c.is_active === false ? "Неактивна" : "Активна"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AdminSection>

        <AdminSection
          title="Ключевые слова"
          subtitle="Ключевые слова (создать/обновить/удалить/список/по категории)."
        >
          <Card>
            <CardHeader>
              <CardTitle>Ключевые слова</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const data = await keywordsApi.getAll();
                      setKeywords(data);
                      setMessage("Ключевые слова загружены.");
                    })
                  }
                >
                  Показать все
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !kwCategory}
                  onClick={() =>
                    run(async () => {
                      const data = await keywordsApi.getByCategory(kwCategory);
                      setKeywords(data);
                      setMessage("Ключевые слова по категории загружены.");
                    })
                  }
                >
                  Показать по категории
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  value={kwCategory}
                  onChange={(e) => setKwCategory(e.target.value.trim())}
                  placeholder="Код категории"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                />
                <input
                  value={kwWord}
                  onChange={(e) => setKwWord(e.target.value)}
                  placeholder="Слово"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
                <input
                  value={kwNewWord}
                  onChange={(e) => setKwNewWord(e.target.value)}
                  placeholder="Новое слово (для обновления)"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || !kwCategory || !kwWord}
                  onClick={() =>
                    run(async () => {
                      await keywordsApi.create({ category_code: kwCategory, word: kwWord });
                      const data = await keywordsApi.getByCategory(kwCategory);
                      setKeywords(data);
                      setMessage("Ключевое слово создано.");
                    })
                  }
                >
                  Создать
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !kwCategory || !kwWord || !kwNewWord}
                  onClick={() =>
                    run(async () => {
                      await keywordsApi.update(kwCategory, kwWord, {
                        category_code: kwCategory,
                        word: kwNewWord,
                      });
                      const data = await keywordsApi.getByCategory(kwCategory);
                      setKeywords(data);
                      setMessage("Ключевое слово обновлено.");
                    })
                  }
                >
                  Обновить
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !kwCategory || !kwWord}
                  onClick={() => {
                    if (!confirm(`Удалить "${kwWord}" из категории ${kwCategory}?`)) return;
                    run(async () => {
                      await keywordsApi.delete(kwCategory, kwWord);
                      const data = await keywordsApi.getByCategory(kwCategory);
                      setKeywords(data);
                      setMessage("Ключевое слово удалено.");
                    });
                  }}
                >
                  Удалить
                </Button>
              </div>

              {keywords && keywords.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {keywords.map((k, idx) => (
                    <button
                      key={`${k.categoryCode}-${k.word}-${idx}`}
                      type="button"
                      onClick={() => {
                        setKwCategory(k.categoryCode);
                        setKwWord(k.word);
                        setKwNewWord("");
                      }}
                      className="text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {k.word}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Категория: <span className="font-mono">{k.categoryCode}</span>
                        {k.createdAt ? ` · ${formatDateTime(k.createdAt)}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AdminSection>

        <AdminSection
          title="Курсы ЦБР"
          subtitle="Курсы валют (поддерживаемые, последние, по дате, синхронизация с ЦБР)."
        >
          <Card>
            <CardHeader>
              <CardTitle>Курсы валют</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const data = await cbrApi.getSupportedCurrencies();
                      setSupportedCurrencies(data);
                      setMessage("Поддерживаемые валюты загружены.");
                    })
                  }
                >
                  Поддерживаемые валюты
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const data = await cbrApi.getLatestRates();
                      setLatestRates(data);
                      setMessage("Последние курсы загружены.");
                    })
                  }
                >
                  Последние курсы
                </Button>
              </div>

              {supportedCurrencies && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Валюты:{" "}
                  <span className="font-mono text-xs">
                    {supportedCurrencies.join(", ")}
                  </span>
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  value={ratesDate}
                  onChange={(e) => setRatesDate(e.target.value)}
                  placeholder="Дата (YYYY-MM-DD)"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                />
                <Button
                  variant="outline"
                  disabled={busy || !ratesDate}
                  onClick={() =>
                    run(async () => {
                      const data = await cbrApi.getRatesByDate(ratesDate);
                      setRatesByDate(data);
                      setMessage("Курсы по дате загружены.");
                    })
                  }
                >
                  Курсы по дате
                </Button>
                <input
                  value={syncDate}
                  onChange={(e) => setSyncDate(e.target.value)}
                  placeholder="Дата синхронизации (YYYY-MM-DD)"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || !syncDate}
                  onClick={() =>
                    run(async () => {
                      await cbrApi.syncFromCbr(syncDate);
                      const data = await cbrApi.getRatesByDate(syncDate);
                      setRatesByDate(data);
                      setMessage("Синхронизация выполнена.");
                    })
                  }
                >
                  Синхронизировать с ЦБР
                </Button>
              </div>

              {displayedCurrencyRates.length > 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="grid grid-cols-4 bg-slate-50 dark:bg-slate-900/60 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <div className="px-3 py-2">Валюта</div>
                    <div className="px-3 py-2">Курс</div>
                    <div className="px-3 py-2">Дата</div>
                    <div className="px-3 py-2">Создано</div>
                  </div>
                  {displayedCurrencyRates.map((r) => (
                    <div
                      key={`${r.currency}-${r.date}-${r.createdAt}`}
                      className="grid grid-cols-4 border-t border-slate-200 dark:border-slate-700 text-sm"
                    >
                      <div className="px-3 py-2 font-mono text-xs">{r.currency}</div>
                      <div className="px-3 py-2">{r.rate}</div>
                      <div className="px-3 py-2 font-mono text-xs">{r.date}</div>
                      <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(r.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </AdminSection>

        <AdminSection
          title="Настройки приложения"
          subtitle="Просмотр и изменение ключей и значений на сервере."
        >
          <Card>
            <CardHeader>
              <CardTitle>Список настроек</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const data = await settingsApi.getAll();
                      setSettingsList(data);
                      const next: Record<string, { value: string; description: string }> = {};
                      for (const s of data) {
                        next[s.setting_key] = {
                          value: s.setting_value ?? "",
                          description: s.description ?? "",
                        };
                      }
                      setSettingEdits(next);
                      setMessage("Настройки загружены.");
                    })
                  }
                >
                  Загрузить все настройки
                </Button>
              </div>
              {settingsList && settingsList.length > 0 ? (
                <div className="space-y-4">
                  {settingsList.map((s) => {
                    const edit = settingEdits[s.setting_key] ?? {
                      value: s.setting_value ?? "",
                      description: s.description ?? "",
                    };
                    return (
                      <div
                        key={s.setting_key}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2"
                      >
                        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{s.setting_key}</p>
                        <label className="block text-xs text-slate-500 dark:text-slate-400">Значение</label>
                        <input
                          value={edit.value}
                          onChange={(e) =>
                            setSettingEdits((prev) => ({
                              ...prev,
                              [s.setting_key]: { ...edit, value: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        />
                        <label className="block text-xs text-slate-500 dark:text-slate-400">Описание</label>
                        <input
                          value={edit.description}
                          onChange={(e) =>
                            setSettingEdits((prev) => ({
                              ...prev,
                              [s.setting_key]: { ...edit, description: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            run(async () => {
                              await settingsApi.update(s.setting_key, {
                                setting_value: edit.value,
                                description: edit.description || undefined,
                              });
                              const data = await settingsApi.getAll();
                              setSettingsList(data);
                              setMessage(`Сохранено: ${s.setting_key}`);
                            })
                          }
                        >
                          Сохранить
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : settingsList && settingsList.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Список пуст.</p>
              ) : null}
            </CardContent>
          </Card>
        </AdminSection>

        <AdminSection
          title="Документация"
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
                Интерфейс Swagger
              </a>
              <a
                href={OPENAPI_SPEC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Спецификация OpenAPI (JSON)
              </a>
            </CardContent>
          </Card>
        </AdminSection>
      </div>
    </AdminRoute>
  );
}
