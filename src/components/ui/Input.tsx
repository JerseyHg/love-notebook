"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-[var(--radius-lg)]",
            "border border-[var(--color-border)] bg-[var(--color-bg-card)]",
            "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-ring)] focus:border-[var(--color-primary)]",
            "transition-all duration-[var(--transition)]",
            error && "border-[var(--color-error)] focus:ring-[var(--color-error)]/25",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
