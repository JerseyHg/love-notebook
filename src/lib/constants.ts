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

/**
 * 纪念日图标选项
 */
export const anniversaryIcons = [
  "❤️", "💕", "🎂", "🎄", "🌹", "💍", "🏠", "✈️", "🎓", "🐾",
];

/**
 * 纪念日重复选项
 */
export const repeatOptions = [
  { value: "yearly" as const, label: "每年" },
  { value: "monthly" as const, label: "每月" },
  { value: "once" as const, label: "仅一次" },
];

/**
 * 主题色选项
 */
export const themeColors = [
  { name: "玫瑰", value: "rose", primary: "#e11d48" },
  { name: "天青", value: "teal", primary: "#5a7d8a" },
  { name: "薰衣草", value: "lavender", primary: "#7c3aed" },
  { name: "琥珀", value: "amber", primary: "#d97706" },
  { name: "森林", value: "forest", primary: "#059669" },
] as const;
