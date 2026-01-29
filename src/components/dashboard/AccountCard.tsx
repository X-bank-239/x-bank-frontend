"use client";

import Link from "next/link";
import { BankAccountResponse } from "@/types";
import {
  formatCurrency,
  getAccountTypeName,
  getAccountCardGradient,
  getAccountCardAccent,
  maskAccountId,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: BankAccountResponse;
  onClick?: () => void;
  /** Вариант: карточка с градиентом (как карта) или минималистичная как в Сбере */
  variant?: "gradient" | "minimal";
}

export function AccountCard({ account, onClick, variant = "gradient" }: AccountCardProps) {
  const gradient = getAccountCardGradient(account.currency);
  const accentBar = getAccountCardAccent(account.currency);

  if (variant === "minimal") {
    return (
      <Link
        href="/dashboard/accounts"
        className={cn(
          "flex items-stretch rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
        )}
      >
        {/* Цветная полоска слева — как в Сбербанк Онлайн */}
        <div className={cn("w-1 shrink-0", accentBar)} />
        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {getAccountTypeName(account.account_type)} • {account.currency}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {maskAccountId(account.account_id)}
            </p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white shrink-0">
            {formatCurrency(account.balance, account.currency)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-xl bg-gradient-to-br text-white overflow-hidden cursor-pointer transition-all shadow-card hover:shadow-card-hover",
        gradient,
        onClick && "hover:scale-[1.01]"
      )}
    >
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/80 text-sm">{getAccountTypeName(account.account_type)}</p>
            <p className="text-lg font-semibold">{account.currency}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        <p className="text-white/80 text-sm mb-1">Баланс</p>
        <p className="text-2xl sm:text-3xl font-bold mb-4">
          {formatCurrency(account.balance, account.currency)}
        </p>

        <p className="text-white/70 text-sm font-mono">
          {maskAccountId(account.account_id)}
        </p>
      </div>
    </div>
  );
}
