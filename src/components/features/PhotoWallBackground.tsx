"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoWallBackgroundProps {
  photos: string[];
}

interface FloatingPhoto {
  id: string;
  src: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
}

function generateLeaves(photos: string[], count: number, batchId: number): FloatingPhoto[] {
  if (photos.length === 0) return [];
  const result: FloatingPhoto[] = [];
  for (let i = 0; i < count; i++) {
    const src = photos[Math.floor(Math.random() * photos.length)];
    // 大小更错落：有几张特别大（220~300），其余中小（90~180）
    const isHuge = i < 1; // 每批 1 张超大图
    const isBig = i >= 1 && i < 3; // 2 张大图
    const size = isHuge ? 320 + Math.random() * 100 : isBig ? 200 + Math.random() * 80 : 80 + Math.random() * 80;
    const x = Math.random() * 82;
    const y = Math.random() * 82;
    const rotate = (Math.random() - 0.5) * 24;
    // 错开出现：0 ~ 4s，更分散
    const delay = Math.random() * 4;
    // 每张停留 10 ~ 14s，更从容
    const duration = 10 + Math.random() * 4;
    result.push({ id: `${batchId}-${i}`, src, x, y, size, rotate, delay, duration });
  }
  return result;
}

export function PhotoWallBackground({ photos }: PhotoWallBackgroundProps) {
  const shuffled = useMemo(() => {
    if (photos.length === 0) return [];
    const pool = [...photos];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [photos]);

  const batchRef = useRef(0);
  const [leaves, setLeaves] = useState<FloatingPhoto[]>([]);

  useEffect(() => {
    if (shuffled.length === 0) return;

    const spawn = () => {
      batchRef.current += 1;
      setLeaves(generateLeaves(shuffled, 6, batchRef.current));
    };

    spawn();
    // 15 秒换一批，节奏更慢更舒服
    const timer = setInterval(spawn, 15000);
    return () => clearInterval(timer);
  }, [shuffled]);

  if (shuffled.length === 0) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* 干净的纯白底 —— 简洁风格 */}
      <div className="absolute inset-0 bg-white" />

      {/* 散落照片 */}
      <AnimatePresence>
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            initial={{
              opacity: 0,
              scale: 0.85,
              rotate: leaf.rotate - 6,
              x: `${leaf.x}vw`,
              y: `${leaf.y}vh`,
            }}
            animate={{
              opacity: [0, 0.22, 0.22, 0],
              scale: [0.85, 1, 1, 0.95],
              rotate: [leaf.rotate - 6, leaf.rotate, leaf.rotate + 2, leaf.rotate + 5],
              y: [`${leaf.y}vh`, `${leaf.y + 1}vh`, `${leaf.y + 2}vh`, `${leaf.y + 4}vh`],
            }}
            transition={{
              duration: leaf.duration,
              delay: leaf.delay,
              ease: "easeInOut",
              times: [0, 0.2, 0.75, 1],
            }}
            className="absolute origin-center"
            style={{
              width: `${leaf.size}px`,
              height: `${leaf.size * 0.72}px`,
            }}
          >
            <div
              className="w-full h-full rounded-2xl overflow-hidden"
              style={{
                filter: "saturate(0.55) brightness(1.1)",
                boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={leaf.src} alt="" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
