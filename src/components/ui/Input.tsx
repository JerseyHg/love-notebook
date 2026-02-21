"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#1a2332] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-xl border border-[#d4dae0]
            bg-white text-[#1a2332] placeholder:text-[#a8b0b8]
            focus:outline-none focus:ring-2 focus:ring-[#5a7d8a]/25 focus:border-[#5a7d8a]
            transition-all duration-250
            ${error ? "border-[#7a5c5c] focus:ring-[#7a5c5c]/25" : ""}
            ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[#7a5c5c]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
