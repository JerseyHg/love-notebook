"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import dayjs from "dayjs";
import { formatDate, moodMap } from "@/lib/utils";
import type { TimelineItem, User } from "@/types";

interface CalendarViewProps {
  items: TimelineItem[];
  users: User[];
  onPhotoClick: (photos: string[], index: number) => void;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export function CalendarView({
  items,
  users,
  onPhotoClick,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 按日期分组
  const groupedByDate = useMemo(() => {
    const map: Record<string, TimelineItem[]> = {};
    items.forEach((item) => {
      const key = dayjs(item.date).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [items]);

  // 生成当月日历格子
  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf("month");
    const end = currentMonth.endOf("month");
    const startDay = start.day() === 0 ? 6 : start.day() - 1; // 周一开始

    const days: Array<{ date: dayjs.Dayjs | null; key: string }> = [];

    // 前面的空格
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, key: `empty-${i}` });
    }

    // 当月每一天
    let d = start;
    while (d.isBefore(end) || d.isSame(end, "day")) {
      days.push({ date: d, key: d.format("YYYY-MM-DD") });
      d = d.add(1, "day");
    }

    return days;
  }, [currentMonth]);

  const selectedItems = selectedDate ? groupedByDate[selectedDate] || [] : [];

  return (
    <div className="space-y-4">
      {/* 月份导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5c6b7a] hover:bg-[#e2e7ec] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-[#1a2332] tracking-wide">
          {currentMonth.format("YYYY 年 M 月")}
        </span>
        <button
          onClick={() => setCurrentMonth((m) => m.add(1, "month"))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5c6b7a] hover:bg-[#e2e7ec] transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] text-[#8a95a0] py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 日历格子 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, key }) => {
          if (!date) {
            return <div key={key} className="aspect-square" />;
          }

          const dateStr = date.format("YYYY-MM-DD");
          const dayItems = groupedByDate[dateStr] || [];
          const count = dayItems.length;
          const isToday = date.isSame(dayjs(), "day");
          const isSelected = dateStr === selectedDate;
          const isFuture = date.isAfter(dayjs(), "day");

          // 热力图颜色深度
          let intensityClass = "bg-[#eef1f3]";
          if (count === 1) intensityClass = "bg-[#d4dae0]";
          else if (count === 2) intensityClass = "bg-[#bcc4cc]";
          else if (count >= 3) intensityClass = "bg-[#5a7d8a]";

          return (
            <button
              key={key}
              onClick={() =>
                count > 0 ? setSelectedDate(isSelected ? null : dateStr) : null
              }
              disabled={isFuture}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center
                text-xs transition-all duration-200 relative
                ${isFuture ? "opacity-30" : ""}
                ${count > 0 ? "cursor-pointer hover:ring-2 hover:ring-[#5a7d8a]/30" : "cursor-default"}
                ${isSelected ? "ring-2 ring-[#5a7d8a]" : ""}
                ${count > 0 ? intensityClass : "bg-[#eef1f3]/50"}
                ${count >= 3 ? "text-white" : "text-[#1a2332]"}`}
            >
              <span className={isToday ? "font-bold" : ""}>
                {date.date()}
              </span>
              {isToday && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#5a7d8a]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-[#8a95a0]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#eef1f3] border border-[#d4dae0]" />
          <span>无记录</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#d4dae0]" />
          <span>1条</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#bcc4cc]" />
          <span>2条</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#5a7d8a]" />
          <span>3+</span>
        </div>
      </div>

      {/* 选中日期的记录详情 */}
      <AnimatePresence>
        {selectedDate && selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1a2332]">
                {formatDate(selectedDate)} 的记录
              </span>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-[#8a95a0] hover:text-[#5c6b7a]"
              >
                <X size={16} />
              </button>
            </div>

            {selectedItems.map((item) => {
              const mood = item.mood ? moodMap[item.mood] : null;
              const author = users.find((u) => u.id === item.authorId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#d4dae0] p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#5c6b7a]">
                      {author?.nickname || "未知"}
                    </span>
                    {mood && <span className="text-sm">{mood.emoji}</span>}
                  </div>

                  <p className="text-sm text-[#1a2332] leading-relaxed">
                    {item.content}
                  </p>

                  {item.photos && item.photos.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {item.photos.map((photo, i) => (
                        <div
                          key={i}
                          onClick={() => onPhotoClick(item.photos, i)}
                          className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[#eef1f3] cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
