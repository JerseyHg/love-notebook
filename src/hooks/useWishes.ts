"use client";

import { useState, useCallback } from "react";
import type { WishItem } from "@/types";

export function useWishes() {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishes(data.data || []);
      }
    } catch (err) {
      console.warn("Fetch wishes failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createWish = useCallback(
    async (data: { title: string; description?: string }) => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("创建失败");
      await fetchWishes();
    },
    [fetchWishes]
  );

  const toggleWish = useCallback(
    async (id: string) => {
      // 乐观更新：先在 UI 上切换状态
      setWishes((prev) =>
        prev.map((w) =>
          w.id === id
            ? { ...w, completed: !w.completed, completedAt: w.completed ? null : new Date().toISOString() }
            : w
        )
      );

      try {
        const res = await fetch(`/api/wishlist/${id}/toggle`, { method: "PUT" });
        if (!res.ok) {
          // 失败则回滚
          await fetchWishes();
        }
      } catch {
        await fetchWishes();
      }
    },
    [fetchWishes]
  );

  const deleteWish = useCallback(
    async (id: string) => {
      setWishes((prev) => prev.filter((w) => w.id !== id));
      try {
        await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
      } catch {
        await fetchWishes();
      }
    },
    [fetchWishes]
  );

  return { wishes, loading, fetchWishes, createWish, toggleWish, deleteWish };
}
