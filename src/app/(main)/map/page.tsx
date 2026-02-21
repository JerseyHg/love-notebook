"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { TimelineItem } from "@/types";

export default function MapPage() {
  const [locations, setLocations] = useState<TimelineItem[]>([]);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/timeline?hasLocation=true");
      if (res.ok) {
        const data = await res.json();
        setLocations(
          (data.data || []).filter(
            (item: TimelineItem) => item.location !== null
          )
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">足迹地图</h1>
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Navigation size={14} />
          <span>{locations.length} 个足迹</span>
        </div>
      </div>

      {/* 地图占位 - 接入腾讯地图后替换 */}
      <Card className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center text-gray-400">
          <MapPin size={40} className="mx-auto mb-2 text-blue-300" />
          <p className="text-sm">
            地图区域
          </p>
          <p className="text-xs mt-1">
            接入腾讯地图 API 后，这里将展示你们的足迹
          </p>
          <p className="text-xs text-gray-300 mt-2">
            在 .env 中配置 NEXT_PUBLIC_TMAP_KEY
          </p>
        </div>
      </Card>

      {/* 足迹列表 */}
      <div className="space-y-3">
        {locations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">
              还没有足迹，在时间轴发布时添加位置信息吧
            </p>
          </div>
        ) : (
          locations.map((item) => (
            <Card key={item.id} hover>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm text-gray-800">
                    {item.location?.name || "未知地点"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {item.content}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
