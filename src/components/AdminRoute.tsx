"use client";

import { useAuth } from "@/contexts/AuthContext";
import { isUserAdmin } from "@/lib/auth-roles";
import Link from "next/link";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-slate-500 dark:text-slate-400 text-sm">
        Загрузка…
      </div>
    );
  }

  if (!isAuthenticated || !isUserAdmin(user)) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Доступ запрещён</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Раздел доступен только пользователям с ролью администратора.
        </p>
        <Link
          href="/dashboard"
          className="inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          На главную
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
