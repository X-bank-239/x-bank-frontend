import { Currency, AccountType, TransactionType } from "@/types";

/**
 * Format currency amount with symbol
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    RUB: "₽",
    USD: "$",
    EUR: "€",
    CNY: "¥",
  };

  const locales: Record<Currency, string> = {
    RUB: "ru-RU",
    USD: "en-US",
    EUR: "de-DE",
    CNY: "zh-CN",
  };

  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency: currency,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}

/**
 * Get currency name in Russian
 */
export function getCurrencyName(currency: Currency): string {
  const names: Record<Currency, string> = {
    RUB: "Рубль",
    USD: "Доллар",
    EUR: "Евро",
    CNY: "Юань",
  };
  return names[currency];
}

/**
 * Get account type name in Russian
 */
export function getAccountTypeName(type: AccountType): string {
  const names: Record<AccountType, string> = {
    CREDIT: "Кредитный",
    DEBIT: "Дебетовый",
  };
  return names[type];
}

/**
 * Get transaction type name in Russian
 */
export function getTransactionTypeName(type: TransactionType): string {
  const names: Record<TransactionType, string> = {
    PAYMENT: "Платёж",
    TRANSFER: "Перевод",
    DEPOSIT: "Пополнение",
  };
  return names[type];
}

/**
 * Format date to Russian locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format short date
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Get gradient/color for account card based on currency (банковская палитра)
 */
export function getAccountCardGradient(currency: Currency): string {
  const gradients: Record<Currency, string> = {
    RUB: "from-primary-600 to-primary-800",
    USD: "from-teal-500 to-primary-700",
    EUR: "from-slate-600 to-slate-800",
    CNY: "from-amber-600 to-amber-800",
  };
  return gradients[currency];
}

/** Цвет верхней полоски карты счёта (стиль Сбера) */
export function getAccountCardAccent(currency: Currency): string {
  const accents: Record<Currency, string> = {
    RUB: "bg-primary-600",
    USD: "bg-teal-500",
    EUR: "bg-slate-600",
    CNY: "bg-amber-600",
  };
  return accents[currency];
}

/**
 * Mask account ID for display
 */
export function maskAccountId(accountId: string): string {
  if (accountId.length < 8) return accountId;
  return `****${accountId.slice(-4).toUpperCase()}`;
}

/**
 * Combine class names
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
