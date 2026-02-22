"use client";

import { useState, useCallback } from "react";
import type { TimelineItem } from "@/types";

/**
 * 时间轴数据管理 Hook
 *
 * 将 timeline/page.tsx 中 200+ 行的数据获取、分页、增删改逻辑
 * 全部抽到这里，页面组件只关心渲染。
 */
export function useTimeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 修正照片 URL
  const fixPhotoUrl = (url: string) => {
    if (url.startsWith("/api/files/uploads/")) {
      return url.replace("/api/files/uploads/", "/uploads/");
    }
    return url;
  };

  const fixItem = (item: TimelineItem): TimelineItem => ({
    ...item,
    photos: Array.isArray(item.photos)
      ? item.photos.map(fixPhotoUrl)
      : [],
  });

  const fetchTimelines = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/timeline?page=${pageNum}&limit=20`);
      if (!res.ok) throw new Error("获取失败");

      const json = await res.json();
      const fixedData = (json.data || []).map(fixItem);

      setItems((prev) => (append ? [...prev, ...fixedData] : fixedData));
      setHasMore(json.hasMore || false);
      setPage(pageNum);
    } catch (err) {
      console.warn("Fetch timelines failed:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchTimelines(page + 1, true);
    }
  }, [fetchTimelines, page, hasMore, loadingMore]);

  const createTimeline = useCallback(
    async (data: {
      content: string;
      photos?: string[];
      mood?: string;
      date?: string;
    }) => {
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("创建失败");
      await fetchTimelines(1); // 刷新列表
    },
    [fetchTimelines]
  );

  const updateTimeline = useCallback(
    async (id: string, data: Partial<TimelineItem>) => {
      const res = await fetch(`/api/timeline/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("更新失败");
      await fetchTimelines(1);
    },
    [fetchTimelines]
  );

  const deleteTimeline = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/timeline/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    []
  );

  return {
    items,
    hasMore,
    loading,
    loadingMore,
    fetchTimelines,
    loadMore,
    createTimeline,
    updateTimeline,
    deleteTimeline,
  };
}
