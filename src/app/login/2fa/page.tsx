"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function TwoFAPage() {
  const TTL_SECONDS = 5 * 60;
  const router = useRouter();
  const { verify2FA } = useAuth();

  const [code, setCode] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TTL_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  useEffect(() => {
    const tempToken = localStorage.getItem("auth_temp_token");
    const tempEmail = localStorage.getItem("auth_temp_email");
    setEmail(tempEmail);

    if (!tempToken) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (isExpired) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsExpired(true);
          localStorage.removeItem("auth_temp_token");
          localStorage.removeItem("auth_temp_email");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isExpired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isExpired) {
        setError("Время подтверждения истекло. Войдите снова.");
        setIsSubmitting(false);
        return;
      }

      const tempToken = localStorage.getItem("auth_temp_token");
      if (!tempToken) {
        router.replace("/login");
        return;
      }

      await verify2FA({ tempToken, code });
      localStorage.removeItem("auth_temp_token");
      localStorage.removeItem("auth_temp_email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка подтверждения 2FA.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-2xl">X</span>
            </div>
            <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100">X-Bank</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card p-8">
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">Подтверждение 2FA</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {email ? <>Введите код для <span className="font-medium">{email}</span></> : "Введите код из приложения/смс"}
          </p>
          <p className={`text-sm mb-4 ${isExpired ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
            {isExpired ? "Код истек. Повторите вход." : `Код действует еще ${formatTime(timeLeft)}`}
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Код
              </label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                placeholder="123456"
                required
                disabled={isExpired || isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isExpired}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? "Проверяем..." : "Подтвердить"}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
              Назад ко входу
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

