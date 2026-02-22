"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { BottomNav } from "@/components/layout/BottomNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ToastProvider } from "@/components/ui/Toast";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // 加载态 - 骨架屏风格
  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] animate-heartbeat mx-auto mb-3 opacity-60 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
              className="opacity-80"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-[var(--color-bg)] transition-colors">
        {/* 顶栏：主题切换 */}
        <header className="sticky top-0 z-40 glass border-b border-[var(--color-border-light)]">
          <div className="max-w-lg lg:max-w-7xl mx-auto px-4 lg:px-8 h-12 flex items-center justify-between">
            <h1 className="text-base font-semibold text-[var(--color-text)] font-[family-name:var(--font-serif)]">
              恋人笔记本
            </h1>
            <div className="relative">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto px-4 pt-4 page-content max-w-lg lg:max-w-7xl lg:px-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </ToastProvider>
  );
}
