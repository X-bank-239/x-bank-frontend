import type { Currency, AccountType, LoanStatus, TransactionType } from "@/types";

/**
 * Format currency amount with symbol (единый формат: знак после числа, запятая как разделитель)
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("ru-RU", {
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
    SAVINGS: "Накопительный",
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
    RUB: "from-emerald-700 to-emerald-900",
    USD: "from-teal-600 to-primary-800",
    EUR: "from-slate-700 to-slate-900",
    CNY: "from-amber-700 to-amber-900",
  };
  return gradients[currency];
}

/** Цвет верхней полоски карты счёта (стиль Сбера) */
export function getAccountCardAccent(currency: Currency): string {
  const accents: Record<Currency, string> = {
    RUB: "bg-emerald-600",
    USD: "bg-teal-500",
    EUR: "bg-slate-600",
    CNY: "bg-amber-600",
  };
  return accents[currency];
}

/** Статус кредита для экрана */
export function getLoanStatusLabel(status: LoanStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Активен";
    case "CLOSED":
      return "Закрыт";
    default:
      return status ? `Неизвестный статус (${status})` : "—";
  }
}

/** Годовая ставка из API (доля, напр. 0.12 → 12%). */
export function formatAnnualInterestRate(rate: number): string {
  return `${Math.round(rate * 10000) / 100}%`;
}

/** GET /loans/rate и annualInterestRate: доля (0.12) или проценты (12). */
export function normalizeLoanAnnualInterestRate(rate: number): number {
  if (!Number.isFinite(rate)) return rate;
  return rate > 1 ? rate / 100 : rate;
}

/** Подпись ставки по кредиту для UI. */
export function formatLoanInterestRateText(
  rate: number,
  options?: { annualSuffix?: boolean }
): string {
  const pct = formatAnnualInterestRate(normalizeLoanAnnualInterestRate(rate));
  return options?.annualSuffix === false
    ? `Ставка по кредиту: ${pct}`
    : `Ставка по кредиту: ${pct} годовых`;
}

/** Подпись ставки по вкладу для UI (interestRate — проценты). */
export function formatSavingsInterestRateText(ratePercent: number): string {
  return `Ставка по вкладу: ${ratePercent}% годовых`;
}

export const SAVINGS_INTEREST_VARIANTS = [
  { allowWithdrawal: true, allowTopUp: true },
  { allowWithdrawal: true, allowTopUp: false },
  { allowWithdrawal: false, allowTopUp: true },
  { allowWithdrawal: false, allowTopUp: false },
] as const;

export function getSavingsInterestVariantLabel(
  allowWithdrawal: boolean,
  allowTopUp: boolean
): string {
  if (allowWithdrawal && allowTopUp) return "Снятие и пополнение";
  if (allowWithdrawal && !allowTopUp) return "Только снятие";
  if (!allowWithdrawal && allowTopUp) return "Только пополнение";
  return "Без снятия и пополнения";
}

/** Статус вклада, если API отдаёт enum латиницей */
export function getSavingsStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "Активен",
    OPEN: "Открыт",
    CLOSED: "Закрыт",
    MATURED: "Срок истёк",
    PENDING: "В обработке",
  };
  return map[status] ?? status;
}

/** Статус транзакции */
export function getTransactionStatusLabel(status: string | undefined): string {
  if (!status) return "—";
  const map: Record<string, string> = {
    PENDING: "В обработке",
    COMPLETED: "Исполнена",
    CANCELLED: "Отменена",
    FAILED: "Ошибка",
  };
  return map[status] ?? status;
}

/** Роль пользователя */
export function getUserRoleLabel(role: string | undefined): string {
  if (role === "ADMIN") return "Администратор";
  if (role === "USER") return "Пользователь";
  return role ?? "—";
}

/**
 * Combine class names
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
