"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { moodMap, weatherMap } from "@/lib/utils";

export default function WriteDiaryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [weather, setWeather] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, mood, weather, isPrivate, date }),
      });

      if (res.ok) {
        router.push("/diary");
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">写日记</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-5 border border-gray-100">
        <Input
          placeholder="给日记起个标题（可选）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天发生了什么..."
          className="w-full p-3 rounded-xl border border-gray-200 resize-none h-48
            focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm leading-relaxed"
          required
        />

        {/* 心情选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">心情</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(moodMap).map(([key, { emoji, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMood(mood === key ? "" : key)}
                className={`text-sm px-3 py-1.5 rounded-full border transition
                  ${mood === key
                    ? "bg-pink-50 border-pink-300 text-pink-600"
                    : "border-gray-200 text-gray-500 hover:border-pink-200"
                  }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* 天气选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">天气</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(weatherMap).map(([key, { emoji, label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setWeather(weather === key ? "" : key)}
                className={`text-sm px-3 py-1.5 rounded-full border transition
                  ${weather === key
                    ? "bg-blue-50 border-blue-300 text-blue-600"
                    : "border-gray-200 text-gray-500 hover:border-blue-200"
                  }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              label="日期"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm transition
              ${isPrivate
                ? "bg-gray-100 border-gray-300 text-gray-700"
                : "border-gray-200 text-gray-400 hover:border-gray-300"
              }`}
          >
            {isPrivate ? <Lock size={14} /> : <Unlock size={14} />}
            {isPrivate ? "私密" : "公开"}
          </button>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" loading={loading}>
            保存日记
          </Button>
        </div>
      </form>
    </div>
  );
}
