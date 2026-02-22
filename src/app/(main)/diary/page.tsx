"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useDiaries } from "@/hooks/useDiaries";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate, moodMap, weatherMap } from "@/lib/utils";

export default function DiaryPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { diaries, loading, error } = useDiaries();

  // ✅ 错误 toast
  useEffect(() => {
    if (error) toast("error", error);
  }, [error, toast]);

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

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">加载中...</p>
        </div>
      ) : diaries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-sm">还没有日记，写下今天的心情吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {diaries.map((diary, index) => {
            const mood = diary.mood ? moodMap[diary.mood] : null;
            const weather = diary.weather ? weatherMap[diary.weather] : null;
            const isOther = diary.authorId !== user?.id;

            return (
              <motion.div
                key={diary.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatDate(diary.date)}
                      </span>
                      {mood && <span title={mood.label}>{mood.emoji}</span>}
                      {weather && <span title={weather.label}>{weather.emoji}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isOther && (
                        <span className="text-xs text-pink-400">
                          {diary.author?.nickname || "TA"}
                        </span>
                      )}
                      {diary.isPrivate && (
                        <Lock size={12} className="text-gray-300" />
                      )}
                    </div>
                  </div>

                  {diary.title && (
                    <h3 className="font-medium text-gray-800 mb-1">{diary.title}</h3>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {diary.content}
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
