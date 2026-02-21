"use client";

import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-2xl border border-[#d4dae0] shadow-sm p-5
          ${hover ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 cursor-pointer" : ""}
          ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
