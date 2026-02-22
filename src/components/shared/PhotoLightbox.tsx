"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoLightboxProps {
  photos: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

/**
 * 全屏照片灯箱
 *
 * 功能：
 * - 全屏查看照片
 * - 左右滑动/箭头键切换
 * - 缩放动画进入退出
 * - 点击遮罩关闭
 */
export function PhotoLightbox({
  photos,
  initialIndex = 0,
  open,
  onClose,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 当 initialIndex 变化时同步
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // 键盘导航
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, currentIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < photos.length - 1 ? i + 1 : i));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  // 滑动手势
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x > threshold) goPrev();
      else if (info.offset.x < -threshold) goNext();
    },
    [goNext, goPrev]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
        >
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* 计数器 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {currentIndex + 1} / {photos.length}
          </div>

          {/* 左箭头 */}
          {currentIndex > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-3 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* 右箭头 */}
          {currentIndex < photos.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-3 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* 图片 - 可拖拽滑动 */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.4 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            className="w-full h-full flex items-center justify-center p-8 cursor-grab active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[currentIndex]}
              alt={`照片 ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg select-none pointer-events-none"
              draggable={false}
            />
          </motion.div>

          {/* 底部缩略图 */}
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === currentIndex
                      ? "border-white scale-110"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
