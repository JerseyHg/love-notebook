"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-[#d4dae0]">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors
                ${isActive
                  ? "text-[#5a7d8a]"
                  : "text-[#8a95a0] hover:text-[#5c6b7a]"
                }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
