"use client";

import useSWRInfinite from "swr/infinite";
import { useMemo, useCallback } from "react";
import type { TimelineItem } from "@/types";
import { apiRequest } from "@/lib/fetcher";

// Timeline 专用 fetcher：保留完整的 { data, hasMore, total } 不解包
const timelineFetcher = async (url: string): Promise<TimelinePage> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("获取失败");
  return res.json();
};

const PAGE_SIZE = 20;

interface TimelinePage {
  data: TimelineItem[];
  hasMore: boolean;
  total: number;
}

// 修正照片 URL（兼容旧数据）
function fixPhotoUrl(url: string) {
  if (url.startsWith("/api/files/uploads/")) {
    return url.replace("/api/files/uploads/", "/uploads/");
  }
  return url;
}

function fixItem(item: TimelineItem): TimelineItem {
  let photos = item.photos;
  if (typeof photos === "string") {
    try {
      photos = JSON.parse(photos as unknown as string);
    } catch {
      photos = [];
    }
  }
  if (!Array.isArray(photos)) photos = [];
  return { ...item, photos: photos.map(fixPhotoUrl) };
}

/**
 * 时间轴数据管理 Hook（SWR 版）
 *
 * ✅ 自动缓存 & 去重
 * ✅ 无限滚动分页
 * ✅ 错误状态暴露给调用方
 * ✅ 支持 location 字段
 */
export function useTimeline() {
  const getKey = (pageIndex: number, previousPageData: TimelinePage | null) => {
    // 到底了，不再请求
    if (previousPageData && !previousPageData.hasMore) return null;
    return `/api/timeline?page=${pageIndex + 1}&limit=${PAGE_SIZE}`;
  };

  const {
    data: pages,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<TimelinePage>(getKey, timelineFetcher, {
    revalidateFirstPage: false,
    revalidateAll: false,
  });

  // 合并所有页数据
  const items = useMemo(() => {
    if (!pages) return [];
    return pages.flatMap((page) => (page.data || []).map(fixItem));
  }, [pages]);

  const hasMore = pages ? (pages[pages.length - 1]?.hasMore ?? false) : false;
  const loadingMore = isValidating && (pages?.length ?? 0) > 0;

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setSize((s) => s + 1);
    }
  }, [loadingMore, hasMore, setSize]);

  const createTimeline = useCallback(
    async (data: {
      content: string;
      photos?: string[];
      mood?: string;
      date?: string;
      location?: { lat: number; lng: number; name: string } | null;
    }) => {
      await apiRequest("/api/timeline", {
        method: "POST",
        body: JSON.stringify(data),
      });
      // 重新获取第一页
      mutate();
    },
    [mutate]
  );

  const updateTimeline = useCallback(
    async (id: string, data: Partial<TimelineItem>) => {
      await apiRequest("/api/timeline", {
        method: "PUT",
        body: JSON.stringify({ id, ...data }),
      });
      mutate();
    },
    [mutate]
  );

  const deleteTimeline = useCallback(
    async (id: string) => {
      await apiRequest(`/api/timeline?id=${id}`, { method: "DELETE" });
      // 乐观更新：立即从缓存中移除
      mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            data: page.data.filter((item) => item.id !== id),
          })),
        { revalidate: false }
      );
    },
    [mutate]
  );

  return {
    items,
    hasMore,
    loading: isLoading,
    loadingMore,
    error: error?.message || null,
    loadMore,
    createTimeline,
    updateTimeline,
    deleteTimeline,
    refresh: () => mutate(),
  };
}
