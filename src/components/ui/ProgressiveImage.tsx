"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
}

/**
 * 渐进式图片加载组件
 *
 * 加载过程：模糊占位 → 加载完成淡入
 * 比空白格子体验好很多
 */
export function ProgressiveImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  onClick,
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[var(--color-bg-subtle)]",
        containerClassName
      )}
      onClick={onClick}
    >
      {/* 骨架屏占位 */}
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* 加载失败占位 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      )}

      {/* 实际图片 */}
      {!error && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
}
