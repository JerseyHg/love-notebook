import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

/**
 * 计算在一起的天数
 */
export function daysTogether(togetherDate: Date | string): number {
  const start = dayjs(togetherDate).startOf("day");
  const now = dayjs().startOf("day");
  return now.diff(start, "day");
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string, format = "YYYY年M月D日"): string {
  return dayjs(date).format(format);
}

/**
 * 相对时间（如：3天前）
 */
export function timeAgo(date: Date | string): string {
  return dayjs(date).fromNow();
}

/**
 * 生成随机邀请码
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
 * 心情 emoji 映射
 */
export const moodMap: Record<string, { emoji: string; label: string }> = {
  happy: { emoji: "😊", label: "开心" },
  love: { emoji: "🥰", label: "甜蜜" },
  calm: { emoji: "😌", label: "平静" },
  sad: { emoji: "😢", label: "难过" },
  excited: { emoji: "🤩", label: "兴奋" },
  miss: { emoji: "🥺", label: "想你" },
  angry: { emoji: "😤", label: "生气" },
  tired: { emoji: "😴", label: "疲惫" },
};

/**
 * 天气图标映射
 */
export const weatherMap: Record<string, { emoji: string; label: string }> = {
  sunny: { emoji: "☀️", label: "晴" },
  cloudy: { emoji: "☁️", label: "多云" },
  rainy: { emoji: "🌧️", label: "雨" },
  snowy: { emoji: "❄️", label: "雪" },
  windy: { emoji: "💨", label: "大风" },
  foggy: { emoji: "🌫️", label: "雾" },
};
