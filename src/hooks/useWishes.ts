"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { fetcher, apiRequest } from "@/lib/fetcher";
import type { WishItem } from "@/types";

/**
 * 心愿清单 Hook（SWR 版）
 *
 * ✅ 乐观更新 toggle / delete
 * ✅ 失败自动回滚（SWR revalidate）
 */
export function useWishes() {
  const { data, error, isLoading, mutate } = useSWR<WishItem[]>(
    "/api/wishlist",
    fetcher
  );

  const wishes = data || [];

  const createWish = useCallback(
    async (input: { title: string; description?: string }) => {
      await apiRequest("/api/wishlist", {
        method: "POST",
        body: JSON.stringify(input),
      });
      mutate();
    },
    [mutate]
  );

  const toggleWish = useCallback(
    async (id: string) => {
      // 乐观更新
      mutate(
        (prev) =>
          prev?.map((w) =>
            w.id === id
              ? {
                  ...w,
                  completed: !w.completed,
                  completedAt: w.completed ? null : new Date().toISOString(),
                }
              : w
          ),
        { revalidate: false }
      );

      try {
        await fetch(`/api/wishlist/${id}/toggle`, { method: "PATCH" });
      } catch {
        // 失败回滚
        mutate();
      }
    },
    [mutate]
  );

  const deleteWish = useCallback(
    async (id: string) => {
      // 乐观更新
      mutate(
        (prev) => prev?.filter((w) => w.id !== id),
        { revalidate: false }
      );

      try {
        await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
      } catch {
        mutate();
      }
    },
    [mutate]
  );

  return {
    wishes,
    loading: isLoading,
    error: error?.message || null,
    refresh: () => mutate(),
    createWish,
    toggleWish,
    deleteWish,
  };
}
