"use client";

import Link from "next/link";
import { BankAccountResponse } from "@/types";
import {
  formatCurrency,
  getAccountTypeName,
  getAccountCardGradient,
  getAccountCardAccent,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: BankAccountResponse;
  nextPaymentDate?: string;
  onClick?: () => void;
  /** Вариант: карточка с градиентом (как карта) или минималистичная как в Сбере */
  variant?: "gradient" | "minimal";
}

function isAccountInactive(account: BankAccountResponse): boolean {
  const maybeActive = (account as BankAccountResponse & { is_active?: unknown }).active;
  const maybeIsActive = (account as BankAccountResponse & { is_active?: unknown }).is_active;
  const raw = maybeActive ?? maybeIsActive;

  if (typeof raw === "boolean") return raw === false;
  if (typeof raw === "number") return raw === 0;
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    return normalized === "false" || normalized === "0" || normalized === "inactive";
  }

  return false;
}

export function AccountCard({ account, nextPaymentDate, onClick, variant = "gradient" }: AccountCardProps) {
  const gradient = getAccountCardGradient(account.currency);
  const accentBar = getAccountCardAccent(account.currency);
  const inactive = isAccountInactive(account);

  if (variant === "minimal") {
    const minimalCardClasses = cn(
      "flex items-stretch rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
    );

    const minimalCardContent = (
      <>
        {/* Цветная полоска слева — как в Сбербанк Онлайн */}
        <div className={cn("w-1 shrink-0", accentBar)} />
        <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3 text-slate-500 dark:text-slate-400">
          {inactive && (
            <div className="inline-flex w-fit items-center rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-amber-800 dark:text-amber-300">
              Неактивный счёт
            </div>
          )}
          <div className="min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {getAccountTypeName(account.account_type)} • {account.currency}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {account.account_id}
              </p>
              {account.account_type === "CREDIT" && nextPaymentDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  След. платеж: {nextPaymentDate}
                </p>
              )}
            </div>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white min-w-0 break-words text-right">
              {formatCurrency(account.balance, account.currency)}
            </p>
          </div>
        </div>
      </>
    );

    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={cn(minimalCardClasses, "w-full text-left")}
        >
          {minimalCardContent}
        </button>
      );
    }

    return (
      <Link href="/dashboard/accounts" className={minimalCardClasses}>
        {minimalCardContent}
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
        <div className="p-4 sm:p-6 min-w-0">
          {inactive && (
            <div className="mb-4 inline-flex items-center rounded-md border border-amber-300/80 bg-amber-100/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
              Неактивный счёт
            </div>
          )}
          <div className="flex justify-between items-start gap-2 mb-6 min-w-0">
            <div className="min-w-0">
              <p className="text-white/80 text-sm">
                {getAccountTypeName(account.account_type)}
              </p>
              <p className="text-lg font-semibold">{account.currency}</p>
            </div>
            <div className="w-10 h-10 shrink-0 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>

          <p className="text-white/80 text-sm mb-1">Баланс</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 break-words min-w-0">
            {formatCurrency(account.balance, account.currency)}
          </p>

          <p className="text-white/70 text-sm font-mono">
            {account.account_id}
          </p>
          {account.account_type === "CREDIT" && nextPaymentDate && (
            <p className="text-white/80 text-xs mt-1">
              След. платеж: {nextPaymentDate}
            </p>
          )}
        </div>
      </div>
  );
}