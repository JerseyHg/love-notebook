"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { formatDate, moodMap } from "@/lib/utils";
import type { TimelineItem, User } from "@/types";

interface MasonryViewProps {
  items: TimelineItem[];
  users: User[];
  currentUserId: string;
  selectedId?: string | null;
  onPhotoClick: (photos: string[], index: number) => void;
  onItemClick: (item: TimelineItem) => void;
}

export function MasonryView({
  items,
  users,
  currentUserId,
  selectedId,
  onPhotoClick,
  onItemClick,
}: MasonryViewProps) {
  // 分成两列，交替分配以平衡高度
  const left: TimelineItem[] = [];
  const right: TimelineItem[] = [];
  items.forEach((item, i) => {
    if (i % 2 === 0) left.push(item);
    else right.push(item);
  });

  const renderCard = (item: TimelineItem, index: number) => {
    const mood = item.mood ? moodMap[item.mood] : null;
    const author = users.find((u) => u.id === item.authorId);
    const hasPhotos = item.photos && item.photos.length > 0;
    const isOwn = item.authorId === currentUserId;
    const isSelected = selectedId === item.id;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
        onClick={() => onItemClick(item)}
        className={`break-inside-avoid mb-3 bg-white rounded-2xl border overflow-hidden
          cursor-pointer transition-all duration-250
          ${isSelected
            ? "border-[#5a7d8a] shadow-md ring-1 ring-[#5a7d8a]/30"
            : "border-[#d4dae0] hover:shadow-md"
          }`}
      >
        {/* 照片区 */}
        {hasPhotos && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.photos[0]}
              alt=""
              className="w-full object-cover"
              style={{
                maxHeight: "280px",
                minHeight: "120px",
              }}
            />
            {item.photos.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                +{item.photos.length - 1}
              </div>
            )}
          </div>
        )}

        {/* 文字区 */}
        <div className="p-3.5">
          {/* 作者 & 日期 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-medium ${
                  isOwn ? "bg-[#5a7d8a]" : "bg-[#6b8a95]"
                }`}
              >
                {(author?.nickname || "?")[0]}
              </div>
              <span className="text-xs text-[#5c6b7a]">
                {author?.nickname || "未知"}
              </span>
            </div>
            {mood && <span className="text-sm">{mood.emoji}</span>}
          </div>

          {/* 内容 */}
          <p
            className={`text-sm text-[#1a2332] leading-relaxed ${
              hasPhotos ? "line-clamp-3" : "line-clamp-6"
            }`}
          >
            {item.content}
          </p>

          {/* 底部信息 */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#e2e7ec]">
            <span className="text-[11px] text-[#8a95a0]">
              {formatDate(item.date, "M月D日")}
            </span>
            {item.location && (
              <div className="flex items-center gap-1 text-[11px] text-[#8a95a0]">
                <MapPin size={10} />
                <span className="truncate max-w-[80px]">{item.location.name}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1 space-y-0">
        {left.map((item, i) => renderCard(item, i * 2))}
      </div>
      <div className="flex-1 space-y-0">
        {right.map((item, i) => renderCard(item, i * 2 + 1))}
      </div>
    </div>
  );
}
