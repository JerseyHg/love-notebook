"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, Star, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/date";
import type { WishItem } from "@/types";

interface WishCardProps {
  wish: WishItem;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function WishCard({ wish, onToggle, onDelete }: WishCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleToggle = useCallback(() => {
    if (!wish.completed) {
      // 完成心愿时播放粒子动画
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    onToggle?.(wish.id);
  }, [wish.id, wish.completed, onToggle]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", duration: 0.4 }}
      className="relative"
    >
      {/* 🎉 完成心愿时的粒子效果 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[var(--radius-xl)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                x: "50%",
                y: "50%",
                scale: 0,
              }}
              animate={{
                opacity: 0,
                x: `${20 + Math.random() * 60}%`,
                y: `${Math.random() * 100}%`,
                scale: 1,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1 + Math.random() * 0.5, ease: "easeOut" }}
              className="absolute text-sm"
            >
              {["✨", "🌟", "💫", "⭐", "🎉", "💖"][i % 6]}
            </motion.div>
          ))}
        </div>
      )}

      <Card
        hover
        className={
          wish.completed
            ? "bg-[var(--color-primary-50)] border-[var(--color-primary-100)]"
            : ""
        }
      >
        <div className="flex items-start gap-3">
          {/* 勾选按钮 */}
          <button
            onClick={handleToggle}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-300 press-effect
              ${
                wish.completed
                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white scale-110"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:scale-105"
              }`}
          >
            {wish.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <Check size={14} />
              </motion.div>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-sm transition-all ${
                wish.completed
                  ? "text-[var(--color-text-muted)] line-through"
                  : "text-[var(--color-text)]"
              }`}
            >
              {wish.title}
            </h3>

            {wish.description && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {wish.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              {wish.completed ? (
                <Sparkles size={12} className="text-[var(--color-primary)]" />
              ) : (
                <Star size={12} className="text-[var(--color-accent)]" />
              )}
              <span className="text-xs text-[var(--color-text-muted)]">
                {wish.completed && wish.completedAt
                  ? `${formatDate(wish.completedAt)} 完成 ✨`
                  : `${formatDate(wish.createdAt)} 许下`}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
