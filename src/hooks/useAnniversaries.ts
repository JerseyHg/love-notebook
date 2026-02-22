"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { fetcher, apiRequest } from "@/lib/fetcher";
import type { AnniversaryItem } from "@/types";

/**
 * 纪念日数据管理 Hook（SWR 版）
 */
export function useAnniversaries() {
  const { data, error, isLoading, mutate } = useSWR<AnniversaryItem[]>(
    "/api/anniversary",
    fetcher
  );

  const createAnniversary = useCallback(
    async (input: {
      title: string;
      date: string;
      icon?: string;
      repeat?: string;
    }) => {
      await apiRequest("/api/anniversary", {
        method: "POST",
        body: JSON.stringify(input),
      });
      mutate();
    },
    [mutate]
  );

  const deleteAnniversary = useCallback(
    async (id: string) => {
      mutate(
        (prev) => prev?.filter((a) => a.id !== id),
        { revalidate: false }
      );
      try {
        await fetch(`/api/anniversary/${id}`, { method: "DELETE" });
      } catch {
        mutate();
      }
    },
    [mutate]
  );

  return {
    items: data || [],
    loading: isLoading,
    error: error?.message || null,
    refresh: () => mutate(),
    createAnniversary,
    deleteAnniversary,
  };
}
