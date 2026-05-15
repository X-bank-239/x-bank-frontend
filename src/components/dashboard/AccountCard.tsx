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
  annualInterestRate?: number;
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

export function AccountCard({
  account,
  nextPaymentDate,
  annualInterestRate,
  onClick,
  variant = "gradient",
}: AccountCardProps) {
  const gradient = getAccountCardGradient(account.currency);
  const accentBar = getAccountCardAccent(account.currency);
  const inactive = isAccountInactive(account);
  const canCopy = typeof window !== "undefined" && typeof navigator !== "undefined";
  /** Было: только CREDIT. Сейчас: ещё DEBIT — кредит наличными привязан к дебету; данные только если родитель передал пропсы. */
  const showExtraPaymentInfo =
    (account.account_type === "CREDIT" || account.account_type === "DEBIT") &&
    (Boolean(nextPaymentDate) || typeof annualInterestRate === "number");

  const copyAccountId = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (canCopy && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(account.account_id);
      } else {
        window.prompt("Скопируйте ID счёта:", account.account_id);
      }
    } catch {
      window.prompt("Скопируйте ID счёта:", account.account_id);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

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
              <div className="mt-0.5 flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all sm:truncate">
                  {account.account_id}
                </p>
                <button
                  type="button"
                  onClick={copyAccountId}
                  className="w-fit shrink-0 rounded-md border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  aria-label="Скопировать ID счёта"
                  title="Скопировать ID счёта"
                >
                  Копировать
                </button>
              </div>
              {showExtraPaymentInfo && nextPaymentDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  След. платеж: {nextPaymentDate}
                </p>
              )}
              {showExtraPaymentInfo && typeof annualInterestRate === "number" && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ставка: {Math.round(annualInterestRate * 10000) / 100}% годовых
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
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={handleCardKeyDown}
          className={cn(minimalCardClasses, "w-full text-left")}
        >
          {minimalCardContent}
        </div>
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

          <div className="text-white/70 text-sm font-mono min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
              <span className="break-all sm:truncate min-w-0">{account.account_id}</span>
              <button
                type="button"
                onClick={copyAccountId}
                className="w-fit shrink-0 rounded-md bg-white/15 hover:bg-white/25 px-2 py-1 text-[11px] font-semibold text-white/95"
                aria-label="Скопировать ID счёта"
                title="Скопировать ID счёта"
              >
                Копировать
              </button>
            </div>
          </div>
          {showExtraPaymentInfo && nextPaymentDate && (
            <p className="text-white/80 text-xs mt-1">
              След. платеж: {nextPaymentDate}
            </p>
          )}
          {showExtraPaymentInfo && typeof annualInterestRate === "number" && (
            <p className="text-white/80 text-xs mt-1">
              Ставка: {Math.round(annualInterestRate * 10000) / 100}% годовых
            </p>
          )}
        </div>
      </div>
  );
}