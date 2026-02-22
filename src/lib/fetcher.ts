/**
 * SWR 全局配置 & 统一 fetcher
 *
 * 用法：
 *   const { data, error } = useSWR('/api/diary', fetcher);
 *   const { data } = useSWR('/api/timeline?page=1', fetcher);
 */

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * 统一 fetch wrapper，配合 SWR 使用
 * - 自动解析 JSON
 * - 非 2xx 自动抛出 ApiError（SWR 会捕获到 error 字段）
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    let message = "请求失败";
    try {
      const body = await res.json();
      message = body.error || body.message || message;
    } catch {
      // 无法解析 JSON，用默认消息
    }
    throw new ApiError(message, res.status);
  }

  const json = await res.json();
  // 兼容 { success, data } 和裸数据两种格式
  return json.data !== undefined ? json.data : json;
}

/**
 * 用于 mutation（POST/PUT/DELETE）的通用请求方法
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers as Record<string, string> },
    ...options,
  });

  if (!res.ok) {
    let message = "操作失败";
    try {
      const body = await res.json();
      message = body.error || body.message || message;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
