import type { LoanResponse } from "@/types";

/** Перед погашением: кредит должен быть в статусе ACTIVE. */
export function assertLoanActiveForRepayment(loan: LoanResponse): void {
  if (loan.status !== "ACTIVE") {
    throw new Error(
      "Кредит закрыт или неактивен — погашение по этому счёту недоступно."
    );
  }
}

/** Активный кредит по дебетовому счёту зачисления/погашения (GET /loans/accounts/{accountId}). */
export function findActiveLoanForDebitAccount(
  loans: LoanResponse[],
  debitAccountId: string
): LoanResponse | undefined {
  return loans.find(
    (l) => l.debitAccountId === debitAccountId && l.status === "ACTIVE"
  );
}

const NO_ACTIVE_LOAN_USER_MESSAGE =
  "Нет активного кредита по этому счёту. Оформите кредит в разделе «Кредиты» или выберите другой счёт.";

/** Ответ API, когда по счёту нет активного договора. */
export function isNoActiveLoanApiMessage(message: string): boolean {
  return /no active loan/i.test(message);
}

/** Понятное сообщение для UI вместо сырого текста бэкенда. */
export function mapLoanRepaymentApiError(message: string): string {
  const normalized = message.trim();
  if (isNoActiveLoanApiMessage(normalized)) {
    return NO_ACTIVE_LOAN_USER_MESSAGE;
  }
  const englishFixes: [RegExp, string][] = [
    [/insufficient\s+funds/i, "Недостаточно средств на счёте."],
    [/loan\s+not\s+found/i, "Кредит не найден."],
    [/invalid\s+amount/i, "Некорректная сумма."],
    [/amount\s+must\s+be\s+positive/i, "Сумма должна быть больше нуля."],
    [/unauthorized/i, "Требуется повторный вход."],
    [/forbidden/i, "Недостаточно прав для операции."],
  ];
  for (const [re, ru] of englishFixes) {
    if (re.test(normalized)) return ru;
  }
  return message;
}
