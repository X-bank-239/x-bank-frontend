"use client";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply saved theme on mount
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.add(savedTheme);
  }, []);

  // Prevent flash during SSR
  if (!mounted) {
    return <div className="dark"><AuthProvider>{children}</AuthProvider></div>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
