"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { transactionsApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import {
  TransactionType,
  TransactionResponse,
  BankAccountResponse,
} from "@/types";
import {
  formatCurrency,
  formatShortDate,
  getTransactionTypeName,
  cn,
} from "@/lib/utils";

type TabType = "history" | "transfer" | "deposit" | "payment";

export default function TransactionsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("history");
  const [selectedAccount, setSelectedAccount] = useState<BankAccountResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form states
  const [amount, setAmount] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set first account as selected by default
  useEffect(() => {
    if (user?.accounts && user.accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(user.accounts[0]);
    }
  }, [user?.accounts, selectedAccount]);

  const loadTransactions = useCallback(async () => {
    if (!selectedAccount) return;

    setIsLoadingTransactions(true);
    try {
      const response = await transactionsApi.getRecent(
        selectedAccount.account_id,
        page,
        10
      );
      setTransactions(response.transactions);
      setTotalPages(Math.ceil(response.total / response.size));
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [selectedAccount, page]);

  useEffect(() => {
    if (selectedAccount && activeTab === "history") {
      loadTransactions();
    }
  }, [selectedAccount, activeTab, loadTransactions]);

  const handleTransaction = async (type: TransactionType) => {
    if (!selectedAccount || !amount) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const transactionData = {
        transaction_type: type,
        amount: parseFloat(amount),
        currency: selectedAccount.currency,
        sender_id: type === "DEPOSIT" ? undefined : selectedAccount.account_id,
        receiver_id: type === "DEPOSIT" ? selectedAccount.account_id : undefined,
        comment: comment || undefined,
      };

      if (type === "TRANSFER") {
        transactionData.receiver_id = receiverEmail;
      }

      switch (type) {
        case "TRANSFER":
          await transactionsApi.transfer(transactionData);
          break;
        case "PAYMENT":
          await transactionsApi.payment(transactionData);
          break;
        case "DEPOSIT":
          await transactionsApi.deposit(transactionData);
          break;
      }

      setSuccess("Операция выполнена успешно!");
      setAmount("");
      setReceiverEmail("");
      setComment("");
      await refreshUser();
      
      const updatedAccount = user?.accounts?.find(
        (acc) => acc.account_id === selectedAccount.account_id
      );
      if (updatedAccount) {
        setSelectedAccount(updatedAccount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка выполнения операции");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "history",
      label: "История",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "transfer",
      label: "Перевод",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      id: "deposit",
      label: "Пополнить",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      id: "payment",
      label: "Платёж",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Операции</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Переводы, платежи и история транзакций</p>
      </div>

      {user?.accounts && user.accounts.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-5 pb-5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Выберите счёт
            </label>
            <div className="flex gap-2 flex-wrap">
              {user.accounts.map((account) => (
                <button
                  key={account.account_id}
                  type="button"
                  onClick={() => {
                    setSelectedAccount(account);
                    setPage(0);
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-lg border-2 transition-all flex flex-col sm:flex-row items-center sm:gap-3 text-center sm:text-left text-sm",
                    selectedAccount?.account_id === account.account_id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{account.currency}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {!selectedAccount ? (
        <Card>
          <CardContent className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Для выполнения операций необходимо сначала открыть счёт
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* History Tab */}
          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>История операций</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full animate-spin" />
                  </div>
                ) : transactions.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {transactions.map((tx, index) => (
                          <div key={`${tx.transaction_date}-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                  tx.transaction_type === "DEPOSIT"
                                    ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                                    : tx.transaction_type === "TRANSFER"
                                    ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                )}
                              >
                                {tx.transaction_type === "DEPOSIT" ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                ) : tx.transaction_type === "TRANSFER" ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                                  {getTransactionTypeName(tx.transaction_type)}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {tx.sender_name && `От: ${tx.sender_name}`}
                                  {tx.receiver_name && ` → ${tx.receiver_name}`}
                                  {tx.comment && ` • ${tx.comment}`}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  {formatShortDate(tx.transaction_date)}
                                </p>
                              </div>
                            </div>
                            <p
                              className={cn(
                                "font-semibold text-base",
                                tx.transaction_type === "DEPOSIT"
                                  ? "text-teal-600 dark:text-teal-400"
                                  : "text-slate-800 dark:text-slate-100"
                              )}
                            >
                              {tx.transaction_type === "DEPOSIT" ? "+" : "-"}
                              {formatCurrency(tx.amount, tx.currency)}
                            </p>
                          </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 0}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          Назад
                        </Button>
                        <span className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                          {page + 1} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= totalPages - 1}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          Вперёд
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Операций пока нет</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transfer Tab */}
          {activeTab === "transfer" && (
            <Card>
              <CardHeader>
                <CardTitle>Перевод на другой счёт</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg text-teal-700 dark:text-teal-400 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      ID счёта получателя
                    </label>
                    <input
                      type="text"
                      value={receiverEmail}
                      onChange={(e) => setReceiverEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      placeholder="UUID счёта получателя"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Сумма ({selectedAccount.currency})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Комментарий (необязательно)
                    </label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      placeholder="Назначение перевода"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleTransaction("TRANSFER")}
                    disabled={isSubmitting || !amount || !receiverEmail}
                  >
                    {isSubmitting ? "Отправка..." : "Перевести"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deposit Tab */}
          {activeTab === "deposit" && (
            <Card>
              <CardHeader>
                <CardTitle>Пополнение счёта</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg text-teal-700 dark:text-teal-400 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Текущий баланс</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Сумма пополнения ({selectedAccount.currency})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Комментарий (необязательно)
                    </label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      placeholder="Источник средств"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleTransaction("DEPOSIT")}
                    disabled={isSubmitting || !amount}
                  >
                    {isSubmitting ? "Пополнение..." : "Пополнить"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Оплата услуг</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg text-teal-700 dark:text-teal-400 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Сумма платежа ({selectedAccount.currency})
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Назначение платежа
                    </label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                      placeholder="Описание платежа"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleTransaction("PAYMENT")}
                    disabled={isSubmitting || !amount}
                  >
                    {isSubmitting ? "Оплата..." : "Оплатить"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
