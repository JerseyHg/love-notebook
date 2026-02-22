// 兼容旧 import 路径（旧组件还在用 @/lib/utils 导入这些）
export { daysTogether, formatDate, timeAgo } from "./date";
export { moodMap, weatherMap } from "./constants";

/**
 * 生成随机邀请码（6 位大写字母+数字，排除易混淆字符）
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * classNames 合并工具（替代 clsx 的轻量版）
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * 等待指定毫秒数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 生成 blur-up 占位 SVG（用于图片渐进加载）
 */
export function blurPlaceholder(w = 10, h = 10): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="1"/>
      </filter>
      <rect width="100%" height="100%" fill="#e2e7ec" filter="url(#b)"/>
    </svg>`
  )}`;
}
