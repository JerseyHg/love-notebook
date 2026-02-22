"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { TimelineItem } from "@/types";

interface LocationsResponse {
  data: TimelineItem[];
  hasMore: boolean;
  total: number;
}

/**
 * 足迹地图数据 Hook
 * 只获取有 location 的 timeline 条目
 */
export function useMapLocations() {
  const { data, error, isLoading, mutate } = useSWR<LocationsResponse>(
    "/api/timeline?hasLocation=true&limit=200",
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("获取足迹失败");
      return res.json();
    }
  );

  const locations = (data?.data || []).filter(
    (item): item is TimelineItem & { location: { lat: number; lng: number; name: string } } =>
      item.location !== null && item.location !== undefined
  );

  return {
    locations,
    total: locations.length,
    loading: isLoading,
    error: error?.message || null,
    refresh: () => mutate(),
  };
}
