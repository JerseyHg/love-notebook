"use client";

import { motion } from "framer-motion";
import { daysTogether, formatDate } from "@/lib/utils";

interface LoveDaysCounterProps {
  togetherDate: string;
  user1Name: string;
  user2Name: string;
}

export function LoveDaysCounter({
  togetherDate,
  user1Name,
  user2Name,
}: LoveDaysCounterProps) {
  const days = daysTogether(togetherDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-2xl border-2 border-[#d4dae0] bg-white px-8 py-10 text-center"
    >
      <p className="text-[#5c6b7a] text-sm tracking-wide">
        {user1Name} & {user2Name}
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="my-5"
      >
        <span className="text-6xl font-light tracking-tight text-[#1a2332]">
          {days}
        </span>
        <span className="text-xl ml-2 text-[#5c6b7a] font-light">天</span>
      </motion.div>

      {/* 金色分隔线 */}
      <div className="w-12 h-[1.5px] bg-[#5a7d8a] mx-auto mb-4" />

      <p className="text-[#8a95a0] text-xs tracking-wider">
        {formatDate(togetherDate)} 至今
      </p>
    </motion.div>
  );
}
