"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, List, Map as MapIcon, ChevronUp, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMapLocations } from "@/hooks/useMapLocations";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { formatDate, moodMap } from "@/lib/utils";
import type { TimelineItem } from "@/types";

// 动态导入 MapView（避免 SSR 问题，Leaflet 需要 window）
const MapView = dynamic(
  () => import("@/components/features/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-2xl bg-[var(--color-bg-subtle)] flex items-center justify-center">
        <div className="text-center text-[var(--color-text-muted)]">
          <MapPin size={32} className="mx-auto mb-2 animate-float" />
          <p className="text-sm">地图加载中...</p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const { user, couple } = useAuthStore();
  const { toast } = useToast();
  const { locations, total, loading, error } = useMapLocations();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (error) toast("error", error);
  }, [error, toast]);

  // 按地点名称分组统计
  const placeStats = useMemo(() => {
    const map = new Map<string, number>();
    locations.forEach((item) => {
      const name = item.location.name;
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [locations]);

  const selectedItem = locations.find((l) => l.id === selectedId) || null;
  const partner = couple?.users.find((u) => u.id !== user?.id);

  const handleSelectItem = (item: TimelineItem) => {
    setSelectedId(selectedId === item.id ? null : item.id);
  };

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">足迹地图</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {loading
              ? "加载中..."
              : total > 0
                ? `${user?.nickname || "你"} 和 ${partner?.nickname || "TA"} 一起去过 ${total} 个地方`
                : "还没有足迹，去时间轴添加位置信息吧"}
          </p>
        </div>
        {total > 0 && (
          <button
            onClick={() => setShowList(!showList)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
              bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]
              hover:bg-[var(--color-border-light)] transition-colors press-effect"
          >
            {showList ? <MapIcon size={14} /> : <List size={14} />}
            {showList ? "地图" : "列表"}
          </button>
        )}
      </div>

      {/* 地点统计标签 */}
      {placeStats.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {placeStats.map(([name, count]) => (
            <div
              key={name}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                bg-[var(--color-bg-card)] border border-[var(--color-border-light)]
                text-[var(--color-text-secondary)]"
            >
              <MapPin size={10} className="text-[var(--color-primary)]" />
              <span className="whitespace-nowrap">{name}</span>
              {count > 1 && (
                <span className="text-[var(--color-text-muted)]">×{count}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 地图区域 */}
      {!showList && (
        <div
          className="relative border border-[var(--color-border-light)] rounded-2xl overflow-hidden shadow-sm"
          style={{ height: "calc(100vh - 280px)", minHeight: "320px" }}
        >
          {total === 0 && !loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-bg-subtle)]">
              <div className="text-center text-[var(--color-text-muted)]">
                <MapPin size={48} className="mx-auto mb-3 text-[var(--color-primary-light)] animate-float" />
                <p className="text-sm font-medium">还没有足迹</p>
                <p className="text-xs mt-1">在时间轴发布动态时添加位置信息</p>
              </div>
            </div>
          ) : (
            <MapView
              locations={locations}
              currentUserId={user?.id}
              onSelectItem={handleSelectItem}
              selectedId={selectedId}
            />
          )}

          {/* 图例 */}
          {total > 0 && (
            <div className="absolute top-3 left-3 z-[400] flex items-center gap-3
              bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5a7d8a]" />
                <span className="text-[var(--color-text-secondary)]">{user?.nickname || "我"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e88d94]" />
                <span className="text-[var(--color-text-secondary)]">{partner?.nickname || "TA"}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 列表视图 */}
      {showList && (
        <div className="space-y-3">
          {locations.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              <p className="text-sm">还没有足迹</p>
            </div>
          ) : (
            locations.map((item, index) => {
              const mood = item.mood ? moodMap[item.mood] : null;
              const isOwn = item.authorId === user?.id;
              const isSelected = selectedId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <Card
                    hover
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? "ring-1 ring-[var(--color-primary)] border-[var(--color-primary)]" : ""
                    }`}
                    onClick={() => {
                      handleSelectItem(item);
                      setShowList(false); // 切换到地图并高亮
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* 左侧：标记 */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isOwn ? "#eef3f5" : "#fdf2f3" }}
                      >
                        <MapPin
                          size={18}
                          style={{ color: isOwn ? "#5a7d8a" : "#e88d94" }}
                        />
                      </div>

                      {/* 中间：内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-medium text-sm text-[var(--color-text)] truncate">
                            {item.location.name}
                          </h3>
                          {mood && <span className="text-sm flex-shrink-0">{mood.emoji}</span>}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--color-text-muted)]">
                          <span>{formatDate(item.date)}</span>
                          <span>·</span>
                          <span>{item.author?.nickname || "未知"}</span>
                        </div>
                      </div>

                      {/* 右侧：缩略图 */}
                      {item.photos?.[0] && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-bg-subtle)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.photos[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* 底部选中项详情（地图模式下） */}
      <AnimatePresence>
        {selectedItem && !showList && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-[var(--color-primary)] border">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-[var(--color-primary)] flex-shrink-0" />
                    <span className="font-medium text-sm text-[var(--color-text)] truncate">
                      {selectedItem.location?.name}
                    </span>
                    {selectedItem.mood && moodMap[selectedItem.mood] && (
                      <span className="text-sm">{moodMap[selectedItem.mood].emoji}</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed mb-1.5">
                    {selectedItem.content}
                  </p>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {formatDate(selectedItem.date)} · {selectedItem.author?.nickname || "未知"}
                  </div>
                </div>
                {selectedItem.photos?.[0] && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-bg-subtle)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedItem.photos[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
