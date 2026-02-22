"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-[var(--radius-lg)] press-effect transition-all duration-[var(--transition)] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-text-inverted)] hover:bg-[var(--color-primary-dark)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
    secondary:
      "bg-[var(--color-bg-subtle)] text-[var(--color-text)] hover:bg-[var(--color-border-light)] border border-[var(--color-border)]",
    ghost:
      "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]",
    danger:
      "bg-red-500 text-white hover:bg-red-600 shadow-[var(--shadow-sm)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
