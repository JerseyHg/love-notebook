"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { fetcher, apiRequest } from "@/lib/fetcher";
import type { DiaryItem } from "@/types";

/**
 * 日记数据管理 Hook（SWR 版）
 *
 * ✅ 自动缓存 & 组件卸载后重新挂载自动复用
 * ✅ 错误状态暴露给调用方
 */
export function useDiaries() {
  const { data, error, isLoading, mutate } = useSWR<DiaryItem[]>(
    "/api/diary",
    fetcher
  );

  const createDiary = useCallback(
    async (input: {
      title?: string;
      content: string;
      mood?: string;
      weather?: string;
      isPrivate?: boolean;
      date?: string;
    }) => {
      const created = await apiRequest<DiaryItem>("/api/diary", {
        method: "POST",
        body: JSON.stringify(input),
      });
      // 乐观更新：把新条目插到最前面
      mutate((prev) => (prev ? [created, ...prev] : [created]), {
        revalidate: true,
      });
      return created;
    },
    [mutate]
  );

  const deleteDiary = useCallback(
    async (id: string) => {
      await apiRequest(`/api/diary?id=${id}`, { method: "DELETE" });
      mutate((prev) => prev?.filter((d) => d.id !== id), {
        revalidate: false,
      });
    },
    [mutate]
  );

  return {
    diaries: data || [],
    loading: isLoading,
    error: error?.message || null,
    refresh: () => mutate(),
    createDiary,
    deleteDiary,
  };
}
