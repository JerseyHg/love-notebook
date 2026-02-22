import { z } from "zod";

// ========================================
// Auth
// ========================================

export const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少 6 位"),
  nickname: z.string().min(1, "请输入昵称").max(20, "昵称不能超过 20 个字"),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const pairSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    togetherDate: z.string().min(1, "请选择在一起的日期"),
  }),
  z.object({
    mode: z.literal("join"),
    inviteCode: z.string().min(1, "请输入邀请码"),
  }),
]);

// ========================================
// Timeline
// ========================================

export const createTimelineSchema = z.object({
  content: z.string().min(1, "内容不能为空"),
  photos: z.array(z.string()).default([]),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      name: z.string(),
    })
    .nullable()
    .default(null),
  mood: z.string().nullable().default(null),
  date: z.string().default(() => new Date().toISOString()),
});

export const updateTimelineSchema = createTimelineSchema.partial();

// ========================================
// Diary
// ========================================

export const createDiarySchema = z.object({
  title: z.string().default(""),
  content: z.string().min(1, "内容不能为空"),
  mood: z.string().nullable().default(null),
  weather: z.string().nullable().default(null),
  isPrivate: z.boolean().default(false),
  date: z.string().default(() => new Date().toISOString()),
});

// ========================================
// Wishlist
// ========================================

export const createWishSchema = z.object({
  title: z.string().min(1, "心愿不能为空"),
  description: z.string().nullable().default(null),
});

// ========================================
// Anniversary
// ========================================

export const createAnniversarySchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  date: z.string().min(1, "请选择日期"),
  icon: z.string().default("❤️"),
  repeat: z.enum(["yearly", "monthly", "once"]).default("yearly"),
  notify: z.boolean().default(true),
});
