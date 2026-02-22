"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,       // 切换标签页不自动刷新
        dedupingInterval: 5000,          // 5 秒内重复请求去重
        errorRetryCount: 2,              // 最多重试 2 次
        shouldRetryOnError: (err) => {
          // 401/403 不重试
          if (err?.status === 401 || err?.status === 403) return false;
          return true;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
