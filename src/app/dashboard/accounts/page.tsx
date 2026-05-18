"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loansApi, savingsApi } from "@/lib/api";
import { AccountCard, AccountQuickActionsModal, OpenAccountDialog } from "@/components/dashboard";
import { Card, CardContent, Button } from "@/components/ui";
import type { LoanResponse, BankAccountResponse, SavingsAccount } from "@/types";

export default function AccountsPage() {
  const { user, refreshUser } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [loans, setLoans] = useState<LoanResponse[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccountResponse | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [loanList, savingsList] = await Promise.all([
          loansApi.list(),
          savingsApi.getAll().catch(() => [] as SavingsAccount[]),
        ]);
        setLoans(loanList);
        setSavingsAccounts(savingsList);
      } catch {
        // Не блокируем страницу счетов при недоступности списков.
      }
    })();
  }, []);

  const nextPaymentByAccountId = useMemo(() => {
    const map = new Map<string, string>();
    for (const loan of loans) {
      if (loan.status !== "ACTIVE") continue;
      map.set(loan.debitAccountId, loan.nextPaymentDate);
      map.set(loan.serviceAccountId, loan.nextPaymentDate);
    }
    return map;
  }, [loans]);

  const annualRateByAccountId = useMemo(() => {
    const map = new Map<string, number>();
    for (const loan of loans) {
      if (loan.status !== "ACTIVE") continue;
      map.set(loan.debitAccountId, loan.annualInterestRate);
      map.set(loan.serviceAccountId, loan.annualInterestRate);
    }
    return map;
  }, [loans]);

  const savingsRateByAccountId = useMemo(() => {
    const map = new Map<string, number>();
    for (const savings of savingsAccounts) {
      map.set(savings.accountId, savings.interestRate);
    }
    return map;
  }, [savingsAccounts]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Мои счета</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Дебетовые, кредитные и накопительные счета. Вклад оформляется в «Накопительные».
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Открыть счёт
        </Button>
      </div>

      <OpenAccountDialog
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onCreated={refreshUser}
      />

      {user?.accounts && user.accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.accounts.map((account) => (
            <AccountCard
              key={account.account_id}
              account={account}
              nextPaymentDate={nextPaymentByAccountId.get(account.account_id)}
              annualInterestRate={annualRateByAccountId.get(account.account_id)}
              savingsInterestRate={savingsRateByAccountId.get(account.account_id)}
              onClick={() => setSelectedAccount(account)}
            />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
              У вас пока нет счетов
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-sm">
              Откройте счёт нужного типа
            </p>
            <Button onClick={() => setIsCreating(true)}>Открыть первый счёт</Button>
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
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Дебетовый</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Повседневные операции и хранение средств.
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
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Кредитный</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Заёмные средства с погашением по графику.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      <AccountQuickActionsModal
        account={selectedAccount}
        open={Boolean(selectedAccount)}
        onClose={() => setSelectedAccount(null)}
        nextPaymentDate={
          selectedAccount ? nextPaymentByAccountId.get(selectedAccount.account_id) : undefined
        }
        annualInterestRate={
          selectedAccount ? annualRateByAccountId.get(selectedAccount.account_id) : undefined
        }
        savingsInterestRate={
          selectedAccount ? savingsRateByAccountId.get(selectedAccount.account_id) : undefined
        }
      />
    </div>
  );
}
