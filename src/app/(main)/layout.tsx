"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { BottomNav } from "@/components/features/BottomNav";

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

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f5f7f8]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-[#5a7d8a] animate-pulse mx-auto mb-3 opacity-60" />
          <p className="text-sm text-[#5c6b7a]">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-[#f5f7f8]">
      <main className="mx-auto px-4 pt-6 page-content max-w-lg lg:max-w-7xl lg:px-8">{children}</main>
      <BottomNav />
    </div>
  );
}
