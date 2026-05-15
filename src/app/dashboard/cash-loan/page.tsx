import { redirect } from "next/navigation";

/** Раздел «Кредит наличными» снят; единый раздел кредита — `/dashboard/loans`. */
export default function CashLoanPage() {
  redirect("/dashboard/loans");
}
