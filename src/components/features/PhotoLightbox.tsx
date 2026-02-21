"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoLightboxProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1);
  }, [currentIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1);
  }, [currentIndex, photos.length, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  // 防止背景滚动
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
            text-white/80 hover:bg-white/20 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* 图片计数 */}
        {photos.length > 1 && (
          <div className="absolute top-6 left-6 text-white/60 text-sm z-10">
            {currentIndex + 1} / {photos.length}
          </div>
        )}

        {/* 左箭头 */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
              bg-white/10 flex items-center justify-center text-white/80
              hover:bg-white/20 transition-colors z-10"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* 图片 */}
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          src={photos[currentIndex]}
          alt={`照片 ${currentIndex + 1}`}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />

        {/* 右箭头 */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
              bg-white/10 flex items-center justify-center text-white/80
              hover:bg-white/20 transition-colors z-10"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
