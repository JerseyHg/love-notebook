"use client";

import { useState, useCallback } from "react";
import type { DiaryItem } from "@/types";

export function useDiaries() {
  const [diaries, setDiaries] = useState<DiaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiaries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/diary");
      if (res.ok) {
        const data = await res.json();
        setDiaries(data.data || []);
      }
    } catch (err) {
      console.warn("Fetch diaries failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDiary = useCallback(
    async (data: {
      title?: string;
      content: string;
      mood?: string;
      weather?: string;
      isPrivate?: boolean;
      date?: string;
    }) => {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("创建失败");
      await fetchDiaries();
    },
    [fetchDiaries]
  );

  return { diaries, loading, fetchDiaries, createDiary };
}
