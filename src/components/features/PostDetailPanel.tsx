"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Trash2, MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, moodMap, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { TimelineItem, User } from "@/types";
import { useState, useCallback } from "react";

interface PostDetailPanelProps {
  item: TimelineItem;
  author?: User;
  isAuthor: boolean;
  onClose: () => void;
  onEdit: (item: TimelineItem) => void;
  onDelete: (id: string) => void;
}

export function PostDetailPanel({
  item,
  author,
  isAuthor,
  onClose,
  onEdit,
  onDelete,
}: PostDetailPanelProps) {
  const mood = item.mood ? moodMap[item.mood] : null;
  const hasPhotos = item.photos && item.photos.length > 0;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Reset photo index when item changes
  useEffect(() => {
    setPhotoIndex(0);
  }, [item.id]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (fullscreen) {
        if (e.key === "Escape") setFullscreen(false);
        if (e.key === "ArrowLeft" && photoIndex > 0) setPhotoIndex((i) => i - 1);
        if (e.key === "ArrowRight" && photoIndex < item.photos.length - 1) setPhotoIndex((i) => i + 1);
      } else {
        if (e.key === "Escape") onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, fullscreen, photoIndex, item.photos.length]);

  const goPrev = useCallback(() => {
    if (photoIndex > 0) setPhotoIndex((i) => i - 1);
  }, [photoIndex]);

  const goNext = useCallback(() => {
    if (photoIndex < item.photos.length - 1) setPhotoIndex((i) => i + 1);
  }, [photoIndex, item.photos.length]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="h-full bg-white rounded-2xl border border-[#d4dae0] overflow-hidden flex flex-col"
      >
        {/* 顶部栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e7ec]">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-medium ${
                isAuthor ? "bg-[#5a7d8a]" : "bg-[#6b8a95]"
              }`}
            >
              {(author?.nickname || "?")[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-[#1a2332]">
                {author?.nickname || "未知"}
              </p>
              <p className="text-[11px] text-[#8a95a0]">{timeAgo(item.createdAt)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8a95a0]
              hover:bg-[#e2e7ec] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto">
          {/* 主图展示区 */}
          {hasPhotos && (
            <div className="relative bg-[#eef1f3]">
              {/* 大图 */}
              <div
                onClick={() => setFullscreen(true)}
                className="cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photos[photoIndex]}
                  alt={`照片 ${photoIndex + 1}`}
                  className="w-full max-h-[400px] object-contain"
                />
              </div>

              {/* 图片导航 */}
              {item.photos.length > 1 && (
                <>
                  {photoIndex > 0 && (
                    <button
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                        bg-white/80 shadow-sm flex items-center justify-center text-[#1a2332]
                        hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  {photoIndex < item.photos.length - 1 && (
                    <button
                      onClick={goNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                        bg-white/80 shadow-sm flex items-center justify-center text-[#1a2332]
                        hover:bg-white transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {/* 计数器 */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white
                    text-xs px-3 py-1 rounded-full">
                    {photoIndex + 1} / {item.photos.length}
                  </div>
                </>
              )}

              {/* 缩略图条 */}
              {item.photos.length > 1 && (
                <div className="flex gap-1.5 p-3 overflow-x-auto">
                  {item.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPhotoIndex(idx)}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        idx === photoIndex
                          ? "border-[#5a7d8a] opacity-100"
                          : "border-transparent opacity-60 hover:opacity-80"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 文字内容 */}
          <div className="px-5 py-5 space-y-4">
            {/* 标签行 */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef1f3] text-[#5c6b7a] text-xs">
                <Calendar size={12} />
                {formatDate(item.date)}
              </div>
              {mood && (
                <div className="px-3 py-1 rounded-full bg-[#eef1f3] text-xs text-[#5c6b7a]">
                  {mood.emoji} {mood.label}
                </div>
              )}
              {item.location && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef1f3] text-xs text-[#5c6b7a]">
                  <MapPin size={12} />
                  {item.location.name}
                </div>
              )}
            </div>

            {/* 正文 */}
            <p className="text-[#1a2332] text-sm leading-[1.8] whitespace-pre-wrap">
              {item.content}
            </p>
          </div>
        </div>

        {/* 底部操作栏 - 仅作者可见 */}
        {isAuthor && (
          <div className="px-5 py-3 border-t border-[#e2e7ec] flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(item)}
            >
              <Pencil size={14} className="mr-1.5" />
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="text-[#7a5c5c] hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </motion.div>

      {/* 全屏预览 */}
      <AnimatePresence>
        {fullscreen && hasPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setFullscreen(false)}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                text-white/80 hover:bg-white/20 transition-colors z-10"
            >
              <X size={20} />
            </button>

            {item.photos.length > 1 && (
              <div className="absolute top-6 left-6 text-white/60 text-sm z-10">
                {photoIndex + 1} / {item.photos.length}
              </div>
            )}

            {photoIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                  bg-white/10 flex items-center justify-center text-white/80
                  hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={photoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              src={item.photos[photoIndex]}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {photoIndex < item.photos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                  bg-white/10 flex items-center justify-center text-white/80
                  hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
