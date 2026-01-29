"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TopNav } from "@/components/dashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-slate-950">
        <TopNav />
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
