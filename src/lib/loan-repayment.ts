import type { LoanResponse } from "@/types";

/** Перед погашением: кредит должен быть в статусе ACTIVE. */
export function assertLoanActiveForRepayment(loan: LoanResponse): void {
  if (loan.status !== "ACTIVE") {
    throw new Error(
      "Кредит закрыт или неактивен — погашение по этому счёту недоступно."
    );
  }
}

/** Активный кредит по кредитному счёту (по данным списка `/loans/list`). */
export function findActiveLoanForCreditAccount(
  loans: LoanResponse[],
  creditAccountId: string
): LoanResponse | undefined {
  return loans.find(
    (l) => l.creditAccountId === creditAccountId && l.status === "ACTIVE"
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
  if (isNoActiveLoanApiMessage(message)) {
    return NO_ACTIVE_LOAN_USER_MESSAGE;
  }
  return message;
}
