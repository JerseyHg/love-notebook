"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, LayoutGrid, Clock, CalendarDays } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTimeline } from "@/hooks/useTimeline";
import { useToast } from "@/components/ui/Toast";
import { LoveDaysCounter } from "@/components/features/LoveDaysCounter";
import { TimelineCard } from "@/components/features/TimelineCard";
import { MasonryView } from "@/components/features/MasonryView";
import { CalendarView } from "@/components/features/CalendarView";
import { PostDetailPanel } from "@/components/features/PostDetailPanel";
import { PhotoUploader } from "@/components/features/PhotoUploader";
import { PhotoWallBackground } from "@/components/features/PhotoWallBackground";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { moodMap } from "@/lib/utils";
import type { TimelineItem } from "@/types";

type ViewMode = "masonry" | "timeline" | "calendar";

const viewModes: { key: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { key: "masonry", icon: LayoutGrid, label: "照片墙" },
  { key: "timeline", icon: Clock, label: "时间轴" },
  { key: "calendar", icon: CalendarDays, label: "日历" },
];

export default function TimelinePage() {
  const { user, couple } = useAuthStore();
  const { toast } = useToast();

  // ✅ 使用 SWR hook 替代手动 fetch
  const {
    items, hasMore, loading, loadingMore, error,
    loadMore, createTimeline, updateTimeline, deleteTimeline,
  } = useTimeline();

  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  // 表单状态
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 删除确认
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ✅ SWR 错误时 toast 提示
  useEffect(() => {
    if (error) toast("error", error);
  }, [error, toast]);

  const allPhotos = useMemo(
    () => items.flatMap((item) => item.photos || []),
    [items]
  );

  const resetForm = () => {
    setContent("");
    setMood("");
    setDate(new Date().toISOString().slice(0, 10));
    setPhotos([]);
    setEditingId(null);
    setShowForm(false);
  };

  // ✅ 提交：用 hook 的 create/update + toast 错误
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      if (editingId) {
        await updateTimeline(editingId, { content, mood, date, photos });
        toast("success", "修改成功");
        setSelectedItem(null);
      } else {
        await createTimeline({ content, photos, mood, date });
        toast("success", "发布成功");
      }
      resetForm();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ 删除：用 hook + toast
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTimeline(deleteId);
      if (selectedItem?.id === deleteId) setSelectedItem(null);
      setDeleteId(null);
      toast("success", "已删除");
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "删除失败");
    }
  };

  const handleEdit = (item: TimelineItem) => {
    setEditingId(item.id);
    setContent(item.content);
    setMood(item.mood || "");
    setDate(item.date.slice(0, 10));
    setPhotos(item.photos || []);
    setShowForm(true);
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectItem = (item: TimelineItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const partner = couple?.users.find((u) => u.id !== user?.id);
  const hasDetail = selectedItem !== null;

  return (
    <>
      <PhotoWallBackground photos={allPhotos} />

      <div className="relative z-[1] space-y-5">
        {couple && (
          <LoveDaysCounter
            togetherDate={couple.togetherDate}
            user1Name={user?.nickname || "我"}
            user2Name={partner?.nickname || "TA"}
          />
        )}

        {/* 工具栏 */}
        <div className="flex items-center justify-between">
          <div className="flex bg-white/80 backdrop-blur-sm rounded-xl border border-[#d4dae0] p-0.5">
            {viewModes.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => { setViewMode(key); setSelectedItem(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200
                  ${viewMode === key
                    ? "bg-[#5a7d8a] text-white shadow-sm"
                    : "text-[#8a95a0] hover:text-[#5c6b7a]"
                  }`}
                title={label}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => {
              if (showForm) resetForm();
              else { setShowForm(true); setSelectedItem(null); }
            }}
          >
            {showForm ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
            {showForm ? "收起" : "记录时刻"}
          </Button>
        </div>

        {/* 发布 / 编辑表单 */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <Card className="backdrop-blur-sm bg-white/90">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {editingId && (
                    <div className="text-xs text-[#5a7d8a] font-medium">正在编辑记录</div>
                  )}

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="记录这个美好时刻..."
                    className="w-full p-3 rounded-xl border border-[#d4dae0] resize-none h-28
                      focus:outline-none focus:ring-2 focus:ring-[#5a7d8a]/25 focus:border-[#5a7d8a]
                      text-sm text-[#1a2332] placeholder:text-[#a8b0b8] bg-white/80"
                    required
                  />

                  <PhotoUploader photos={photos} onChange={setPhotos} />

                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(moodMap).map(([key, { emoji, label }]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMood(mood === key ? "" : key)}
                        className={`text-sm px-3 py-1 rounded-full border transition-all duration-200
                          ${mood === key
                            ? "bg-[#eef1f3] border-[#5a7d8a] text-[#1a2332]"
                            : "border-[#d4dae0] text-[#8a95a0] hover:border-[#5a7d8a]/50"
                          }`}
                      >
                        {emoji} {label}
                      </button>
                    ))}
                  </div>

                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" type="button" onClick={resetForm}>取消</Button>
                    <Button type="submit" loading={submitting}>
                      {editingId ? "保存修改" : "发布"}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 内容区域 */}
        {items.length === 0 ? (
          loading ? (
            <div className="text-center py-16 text-[#8a95a0]">
              <p className="text-sm">加载中...</p>
            </div>
          ) : (
            <div className="text-center py-16 text-[#8a95a0]">
              <p className="text-4xl mb-3">📸</p>
              <p className="text-sm">记录你们的第一个美好时刻吧</p>
            </div>
          )
        ) : (
          <div className="flex gap-6 items-start">
            {/* 左侧：列表区域 */}
            <div
              className="min-w-0"
              style={{
                flex: hasDetail ? "0 0 42%" : "1 1 100%",
                transition: "flex 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {viewMode === "masonry" && (
                <MasonryView
                  items={items}
                  users={couple?.users || []}
                  currentUserId={user?.id || ""}
                  selectedId={selectedItem?.id}
                  onPhotoClick={() => {}}
                  onItemClick={handleSelectItem}
                />
              )}

              {viewMode === "timeline" && (
                <div className="space-y-5 relative">
                  {items.length > 0 && (
                    <div className="absolute left-[5px] top-4 bottom-4 w-[1px] bg-[#d4dae0]" />
                  )}
                  {items.map((item) => (
                    <TimelineCard
                      key={item.id}
                      item={item}
                      authorName={
                        item.author?.nickname ||
                        couple?.users.find((u) => u.id === item.authorId)?.nickname ||
                        "未知"
                      }
                      isAuthor={item.authorId === user?.id}
                      isSelected={selectedItem?.id === item.id}
                      onSelect={handleSelectItem}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteId(id)}
                      onPhotoClick={() => {}}
                    />
                  ))}
                </div>
              )}

              {viewMode === "calendar" && (
                <Card>
                  <CalendarView
                    items={items}
                    users={couple?.users || []}
                    onPhotoClick={() => {}}
                  />
                </Card>
              )}

              {/* 加载更多 */}
              {hasMore && viewMode !== "calendar" && (
                <div className="text-center pt-2 pb-4">
                  <Button variant="ghost" size="sm" loading={loadingMore} onClick={loadMore}>
                    加载更多
                  </Button>
                </div>
              )}
            </div>

            {/* 右侧：详情面板（桌面端） */}
            <div
              className="sticky top-4 hidden lg:block overflow-hidden"
              style={{
                flex: hasDetail ? "0 0 56%" : "0 0 0%",
                opacity: hasDetail ? 1 : 0,
                maxHeight: "calc(100vh - 2rem)",
                transition: "flex 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                pointerEvents: hasDetail ? "auto" : "none",
              }}
            >
              {selectedItem && (
                <PostDetailPanel
                  key={selectedItem.id}
                  item={selectedItem}
                  author={couple?.users.find((u) => u.id === selectedItem.authorId)}
                  isAuthor={selectedItem.authorId === user?.id}
                  onClose={() => setSelectedItem(null)}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteId(id)}
                />
              )}
            </div>

            {/* 手机端全屏详情 */}
            <AnimatePresence>
              {hasDetail && selectedItem && (
                <motion.div
                  key="mobile-detail"
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="fixed inset-0 z-50 bg-[#f5f7f8] lg:hidden overflow-hidden"
                >
                  <div className="h-full overflow-y-auto">
                    <PostDetailPanel
                      item={selectedItem}
                      author={couple?.users.find((u) => u.id === selectedItem.authorId)}
                      isAuthor={selectedItem.authorId === user?.id}
                      onClose={() => setSelectedItem(null)}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 删除确认弹窗 */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-xl"
            >
              <p className="text-[#1a2332] font-medium mb-2">确定删除？</p>
              <p className="text-sm text-[#5c6b7a] mb-5">此操作不可撤销</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>
                  取消
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleDelete}>
                  删除
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}
