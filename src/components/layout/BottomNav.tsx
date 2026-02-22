"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, BookOpen, Map, Star, CalendarHeart } from "lucide-react";

const navItems = [
  { href: "/timeline", icon: Clock, label: "时间轴" },
  { href: "/diary", icon: BookOpen, label: "日记" },
  { href: "/map", icon: Map, label: "足迹" },
  { href: "/wishlist", icon: Star, label: "心愿" },
  { href: "/anniversary", icon: CalendarHeart, label: "纪念日" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--color-border)]">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[var(--radius-lg)] transition-colors press-effect"
            >
              {/* 选中指示器 */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-5 h-0.5 rounded-full bg-[var(--color-primary)]"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                />
              )}

              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                className={
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                }
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
