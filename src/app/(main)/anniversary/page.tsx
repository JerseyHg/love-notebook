"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarHeart } from "lucide-react";
import { useAnniversaries } from "@/hooks/useAnniversaries";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import dayjs from "dayjs";

function daysUntilNext(dateStr: string, repeat: string): number {
  const now = dayjs().startOf("day");
  const date = dayjs(dateStr);

  if (repeat === "once") {
    return date.diff(now, "day");
  }

  let next = date;
  if (repeat === "yearly") {
    next = date.year(now.year());
    if (next.isBefore(now)) next = next.add(1, "year");
  } else if (repeat === "monthly") {
    next = date.month(now.month()).year(now.year());
    if (next.isBefore(now)) next = next.add(1, "month");
  }

  return next.diff(now, "day");
}

const icons = ["❤️", "💕", "🎂", "🎄", "🌹", "💍", "🏠", "✈️", "🎓", "🐾"];
const repeatOptions = [
  { value: "yearly", label: "每年" },
  { value: "monthly", label: "每月" },
  { value: "once", label: "仅一次" },
];

export default function AnniversaryPage() {
  const { toast } = useToast();
  const { items, loading, error, createAnniversary, deleteAnniversary } = useAnniversaries();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [icon, setIcon] = useState("❤️");
  const [repeat, setRepeat] = useState("yearly");
  const [submitting, setSubmitting] = useState(false);

  // ✅ 错误 toast
  useEffect(() => {
    if (error) toast("error", error);
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSubmitting(true);

    try {
      await createAnniversary({ title, date, icon, repeat });
      toast("success", "纪念日已添加");
      setTitle("");
      setDate("");
      setIcon("❤️");
      setShowForm(false);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "添加失败");
    } finally {
      setSubmitting(false);
    }
  };

  const sorted = [...items].sort(
    (a, b) => daysUntilNext(a.date, a.repeat) - daysUntilNext(b.date, b.repeat)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">纪念日</h1>
          <CalendarHeart size={18} className="text-pink-400" />
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" />
          添加
        </Button>
      </div>

      {/* 添加表单 */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="纪念日名称"
                placeholder="如：恋爱纪念日"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                label="日期"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">图标</label>
                <div className="flex gap-2 flex-wrap">
                  {icons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition
                        ${icon === ic ? "bg-pink-50 border-pink-300" : "border-gray-200 hover:border-pink-200"}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">重复</label>
                <div className="flex gap-2">
                  {repeatOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRepeat(opt.value)}
                      className={`text-sm px-4 py-1.5 rounded-full border transition
                        ${repeat === opt.value
                          ? "bg-pink-50 border-pink-300 text-pink-600"
                          : "border-gray-200 text-gray-500"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
                  取消
                </Button>
                <Button type="submit" loading={submitting}>
                  保存
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* 纪念日列表 */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">加载中...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm">添加你们的第一个纪念日吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => {
            const days = daysUntilNext(item.date, item.repeat);
            const isToday = days === 0;
            const isPast = item.repeat === "once" && days < 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={isToday ? "ring-2 ring-pink-300 bg-pink-50/50" : ""}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isToday ? (
                        <span className="text-sm font-bold text-pink-500">就是今天!</span>
                      ) : isPast ? (
                        <span className="text-xs text-gray-400">已过</span>
                      ) : (
                        <span className="text-sm font-semibold text-gray-700">
                          还有 <span className="text-pink-500">{days}</span> 天
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
