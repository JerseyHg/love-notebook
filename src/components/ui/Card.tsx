"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border-light)] p-4",
        "bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]",
        "transition-all duration-[var(--transition)]",
        hover && "card-hover cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
