"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate, moodMap, timeAgo } from "@/lib/utils";
import type { TimelineItem } from "@/types";

interface TimelineCardProps {
  item: TimelineItem;
  authorName: string;
  isAuthor?: boolean;
  isSelected?: boolean;
  onSelect?: (item: TimelineItem) => void;
  onEdit?: (item: TimelineItem) => void;
  onDelete?: (id: string) => void;
  onPhotoClick?: (photos: string[], index: number) => void;
}

export function TimelineCard({
  item,
  authorName,
  isAuthor = false,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onPhotoClick,
}: TimelineCardProps) {
  const mood = item.mood ? moodMap[item.mood] : null;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-start gap-4"
    >
      {/* 时间轴圆点 */}
      <div className="flex-shrink-0 mt-1">
        <div
          className={`w-3 h-3 rounded-full ring-4 ring-[#f5f7f8] transition-colors duration-200 ${
            isSelected ? "bg-[#5a7d8a] scale-125" : "bg-[#5a7d8a]"
          }`}
        />
      </div>

      <div
        onClick={() => onSelect?.(item)}
        className={`flex-1 cursor-pointer transition-all duration-250 rounded-2xl ${
          isSelected
            ? "ring-1 ring-[#5a7d8a]/40"
            : ""
        }`}
      >
        <Card className={`relative ${isSelected ? "border-[#5a7d8a]" : ""}`}>
          {/* 头部信息 */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#1a2332]">{authorName}</span>
              {mood && (
                <span className="text-sm" title={mood.label}>
                  {mood.emoji}
                </span>
              )}
              <span className="text-[11px] text-[#8a95a0]">{timeAgo(item.createdAt)}</span>
            </div>

            {/* 操作菜单 */}
            {isAuthor && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8a95a0] hover:bg-[#e2e7ec] transition-colors"
                >
                  <MoreVertical size={16} />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                    <div className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-[#d4dae0] shadow-lg py-1 min-w-[100px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onEdit?.(item);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1a2332] hover:bg-[#eef1f3] transition-colors"
                      >
                        <Pencil size={14} />
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onDelete?.(item.id);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#7a5c5c] hover:bg-[#eef1f3] transition-colors"
                      >
                        <Trash2 size={14} />
                        删除
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 日期标签 */}
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#eef1f3] text-[#5c6b7a] text-xs mb-3">
            {formatDate(item.date)}
          </div>

          {/* 内容 */}
          <p className="text-[#1a2332] text-sm leading-relaxed mb-3">{item.content}</p>

          {/* 图片网格 */}
          {item.photos.length > 0 && (
            <div
              className={`grid gap-1.5 mb-3 ${
                item.photos.length === 1
                  ? "grid-cols-1"
                  : item.photos.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {item.photos.slice(0, 9).map((photo, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPhotoClick?.(item.photos, index);
                  }}
                  className="aspect-square rounded-lg overflow-hidden bg-[#eef1f3] cursor-pointer
                    hover:opacity-90 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`照片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 位置信息 */}
          {item.location && (
            <div className="flex items-center gap-1.5 text-xs text-[#8a95a0]">
              <MapPin size={12} />
              <span>{item.location.name}</span>
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
