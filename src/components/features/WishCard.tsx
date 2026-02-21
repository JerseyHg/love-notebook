"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { WishItem } from "@/types";

interface WishCardProps {
  wish: WishItem;
  onToggle?: (id: string) => void;
}

export function WishCard({ wish, onToggle }: WishCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card hover className={wish.completed ? "bg-green-50/50 border-green-100" : ""}>
        <div className="flex items-start gap-3">
          {/* 勾选按钮 */}
          <button
            onClick={() => onToggle?.(wish.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${wish.completed
                ? "bg-green-500 border-green-500 text-white"
                : "border-gray-300 hover:border-pink-400"
              }`}
          >
            {wish.completed && <Check size={14} />}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-sm ${
                wish.completed ? "text-gray-400 line-through" : "text-gray-800"
              }`}
            >
              {wish.title}
            </h3>

            {wish.description && (
              <p className="text-xs text-gray-500 mt-1">{wish.description}</p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Star size={12} className="text-yellow-400" />
              <span className="text-xs text-gray-400">
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
