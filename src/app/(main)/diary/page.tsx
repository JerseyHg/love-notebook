"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate, moodMap, weatherMap } from "@/lib/utils";
import type { DiaryItem } from "@/types";

export default function DiaryPage() {
  const { user } = useAuthStore();
  const [diaries, setDiaries] = useState<DiaryItem[]>([]);

  const fetchDiaries = useCallback(async () => {
    try {
      const res = await fetch("/api/diary");
      if (res.ok) {
        const data = await res.json();
        setDiaries(data.data || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">日记</h1>
        <Link href="/diary/write">
          <Button size="sm">
            <Plus size={16} className="mr-1" />
            写日记
          </Button>
        </Link>
      </div>

      {diaries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-sm">还没有日记，写下今天的心情吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {diaries.map((diary, index) => {
            const mood = diary.mood ? moodMap[diary.mood] : null;
            const weather = diary.weather ? weatherMap[diary.weather] : null;
            const isOwn = diary.authorId === user?.id;

            return (
              <motion.div
                key={diary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm">
                        {diary.title || "无标题"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatDate(diary.date)}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-pink-400">
                          {diary.author.nickname}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {mood && <span title={mood.label}>{mood.emoji}</span>}
                      {weather && <span title={weather.label}>{weather.emoji}</span>}
                      {diary.isPrivate && (
                        <Lock size={14} className="text-gray-300" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {diary.isPrivate && !isOwn
                      ? "这是一篇私密日记 🔒"
                      : diary.content}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
