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
export function formatDate(
  date: Date | string,
  format = "YYYY年M月D日"
): string {
  return dayjs(date).format(format);
}

/**
 * 相对时间（如：3天前）
 */
export function timeAgo(date: Date | string): string {
  return dayjs(date).fromNow();
}

/**
 * 计算到下一个纪念日的天数
 */
export function daysUntilNext(dateStr: string, repeat: string): number {
  const now = dayjs().startOf("day");
  const date = dayjs(dateStr);

  if (repeat === "once") {
    return date.diff(now, "day");
  }

  let next = date;
  if (repeat === "yearly") {
    next = date.year(now.year());
    if (next.isBefore(now)) next = next.add(1, "year");
  } else if (repeat === "monthly") {
    next = date.month(now.month()).year(now.year());
    if (next.isBefore(now)) next = next.add(1, "month");
  }

  return next.diff(now, "day");
}
