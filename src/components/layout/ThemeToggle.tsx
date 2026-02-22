"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Moon, Sun, X } from "lucide-react";
import { themeColors } from "@/lib/constants";

export function ThemeToggle() {
  const [showPanel, setShowPanel] = useState(false);
  const [theme, setTheme] = useState("teal");
  const [darkMode, setDarkMode] = useState(false);

  // 初始化：从 localStorage 读取
  useEffect(() => {
    const savedTheme = localStorage.getItem("love-theme") || "teal";
    const savedMode = localStorage.getItem("love-dark") === "true";
    setTheme(savedTheme);
    setDarkMode(savedMode);
    applyTheme(savedTheme, savedMode);
  }, []);

  const applyTheme = useCallback((t: string, dark: boolean) => {
    const html = document.documentElement;
    html.setAttribute("data-theme", t);
    html.setAttribute("data-mode", dark ? "dark" : "light");
  }, []);

  const changeTheme = (t: string) => {
    setTheme(t);
    localStorage.setItem("love-theme", t);
    applyTheme(t, darkMode);
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("love-dark", String(next));
    applyTheme(theme, next);
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="w-9 h-9 rounded-full flex items-center justify-center
          bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]
          hover:text-[var(--color-text)] hover:bg-[var(--color-border-light)]
          transition-all press-effect"
      >
        <Palette size={18} />
      </button>

      <AnimatePresence>
        {showPanel && (
          <>
            {/* 遮罩 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPanel(false)}
            />

            {/* 面板 */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-56
                bg-[var(--color-bg-card)] border border-[var(--color-border-light)]
                rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-4 space-y-4"
            >
              {/* 关闭 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  主题设置
                </span>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-[var(--color-text-muted)]"
                >
                  <X size={14} />
                </button>
              </div>

              {/* 深色模式切换 */}
              <button
                onClick={toggleDark}
                className="w-full flex items-center justify-between px-3 py-2
                  rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)]
                  hover:bg-[var(--color-border-light)] transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                  {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                  {darkMode ? "深色模式" : "浅色模式"}
                </div>
                <div
                  className={`w-8 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                    darkMode
                      ? "bg-[var(--color-primary)] justify-end"
                      : "bg-[var(--color-border)] justify-start"
                  }`}
                >
                  <motion.div
                    layout
                    className="w-4 h-4 rounded-full bg-white shadow"
                  />
                </div>
              </button>

              {/* 主题色选择 */}
              <div>
                <span className="text-xs text-[var(--color-text-muted)] mb-2 block">
                  主题颜色
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {themeColors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => changeTheme(c.value)}
                      title={c.name}
                      className={`w-8 h-8 rounded-full transition-all press-effect ${
                        theme === c.value
                          ? "ring-2 ring-offset-2 ring-[var(--color-primary)] scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.primary }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
