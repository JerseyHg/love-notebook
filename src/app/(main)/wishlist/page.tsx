"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { WishCard } from "@/components/features/WishCard";
import type { WishItem } from "@/types";

export default function WishlistPage() {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWishes = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishes(data.data || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setShowForm(false);
        fetchWishes();
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const toggleWish = async (id: string) => {
    try {
      await fetch(`/api/wishlist/${id}/toggle`, { method: "PATCH" });
      fetchWishes();
    } catch {
      /* ignore */
    }
  };

  const pending = wishes.filter((w) => !w.completed);
  const completed = wishes.filter((w) => w.completed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">心愿清单</h1>
          <Sparkles size={18} className="text-yellow-400" />
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" />
          许愿
        </Button>
      </div>

      {/* 许愿表单 */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="想和 TA 一起做什么？"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="补充一下细节（可选）"
                className="w-full p-3 rounded-xl border border-gray-200 resize-none h-16
                  focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
                  取消
                </Button>
                <Button type="submit" loading={loading}>
                  许下心愿
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* 未完成 */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-500">
            待完成 ({pending.length})
          </h2>
          <AnimatePresence>
            {pending.map((wish) => (
              <WishCard key={wish.id} wish={wish} onToggle={toggleWish} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 已完成 */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-500">
            已完成 ({completed.length})
          </h2>
          <AnimatePresence>
            {completed.map((wish) => (
              <WishCard key={wish.id} wish={wish} onToggle={toggleWish} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {wishes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-sm">许下你们的第一个心愿吧</p>
        </div>
      )}
    </div>
  );
}
