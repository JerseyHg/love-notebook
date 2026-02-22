# Love-Notebook 改造指南

## 📦 安装依赖

```bash
npm install swr
```

> 如果后续不再使用 `cos-nodejs-sdk-v5` 的 `putObject`（upload 路由已改为 fetch + 签名），
> 可以考虑移除：`npm uninstall cos-nodejs-sdk-v5`
> 但如果其他地方还用到了该 SDK，则保留。

---

## 📁 需要替换/新增的文件清单

### 🔴 P1: Prisma Schema + 数据库迁移

| 文件 | 操作 | 说明 |
|------|------|------|
| `prisma/schema.prisma` | **替换** | Diary 新增 coupleId + couple 关系；Timeline 新增 author 关系；User 新增 timelines 反向关系 |
| `prisma/migrations/add_diary_coupleId_timeline_author/migration.sql` | **新增** | 手动执行的 SQL 迁移脚本 |

**迁移步骤：**

```bash
# 方式 A：手动执行 SQL（推荐，生产环境）
mysql -u root -p love_notebook < prisma/migrations/add_diary_coupleId_timeline_author/migration.sql

# 方式 B：使用 Prisma 迁移（开发环境）
npx prisma migrate dev --name add_diary_coupleId_timeline_author

# 迁移后重新生成 Prisma Client
npx prisma generate
```

### 🟠 P1: 更新 Service 层 & API

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/services/diary.service.ts` | **替换** | `createDiary` 新增 coupleId 参数；`getDiaries` 直接用 coupleId 查询 |
| `src/services/timeline.service.ts` | **替换** | 所有查询 include author 信息 |
| `src/app/api/diary/route.ts` | **替换** | POST 时传入 `user.coupleId` |
| `src/types/timeline.ts` | **替换** | 新增 TimelineAuthor 接口 + author 可选字段 |
| `src/types/diary.ts` | **替换** | 新增 coupleId 字段 |

### 🟡 P2: SWR 引入 + Hooks 改造

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/lib/fetcher.ts` | **新增** | SWR fetcher + apiRequest 通用请求方法 |
| `src/components/providers/SWRProvider.tsx` | **新增** | SWR 全局配置 Provider |
| `src/app/(main)/layout.tsx` | **替换** | 包裹 SWRProvider |
| `src/hooks/useTimeline.ts` | **替换** | useSWRInfinite 重写，支持无限滚动 |
| `src/hooks/useDiaries.ts` | **替换** | useSWR 重写，乐观更新 |
| `src/hooks/useWishes.ts` | **替换** | useSWR 重写，乐观更新 |
| `src/hooks/useAnniversaries.ts` | **新增** | useSWR 重写（之前没有独立 hook） |

### 🟡 P2: 页面组件拆分（接入 hooks）

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/app/(main)/timeline/page.tsx` | **替换** | 使用 useTimeline() + useToast()，移除 200+ 行内联 fetch |
| `src/app/(main)/diary/page.tsx` | **替换** | 使用 useDiaries() + useToast() |
| `src/app/(main)/diary/write/page.tsx` | **替换** | 使用 useDiaries().createDiary + useToast() |
| `src/app/(main)/wishlist/page.tsx` | **替换** | 使用 useWishes() + useToast() |
| `src/app/(main)/anniversary/page.tsx` | **替换** | 使用 useAnniversaries() + useToast() |

### 🟡 P2: 错误静默 / 签名重复修复

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/features/PhotoUploader.tsx` | **替换** | 新增 onError 回调，不再 `catch { /* ignore */ }` |
| `src/app/api/upload/route.ts` | **替换** | 移除 cos-nodejs-sdk-v5 实例，改用 cos.ts 签名 + fetch PUT |
| `src/middleware.ts` | **替换** | JWT_SECRET 缺失时 throw 而非空字符串 fallback |

---

## ✅ 改造前后对比

### 数据获取：手动 fetch → SWR

```tsx
// ❌ 改造前
const [data, setData] = useState([]);
const fetchData = useCallback(async () => {
  try {
    const res = await fetch('/api/diary');
    if (res.ok) { setData(await res.json()); }
  } catch { /* ignore */ }  // 错误被吞掉
}, []);
useEffect(() => { fetchData(); }, [fetchData]);

// ✅ 改造后
const { diaries, loading, error } = useDiaries();  // SWR 自动缓存
useEffect(() => {
  if (error) toast("error", error);  // 错误有反馈
}, [error]);
```

### 页面组件：500 行 → 200 行

Timeline 页面从 ~500 行减到 ~250 行，数据逻辑全部在 `useTimeline()` hook 中。

### COS 签名：两套 → 一套

Upload 路由不再单独实例化 `cos-nodejs-sdk-v5`，统一使用 `src/lib/server/cos.ts` 的签名方法。

---

## ⚠️ 注意事项

1. **数据库迁移**：迁移 SQL 会回填 Diary 的 coupleId（从关联 User 的 coupleId 复制）。请在低峰期执行。

2. **SWR 缓存行为**：默认 `revalidateOnFocus: false`（在 SWRProvider 中配置），切换标签页不会自动刷新。如需更积极的缓存策略，可调整 SWRProvider。

3. **PhotoUploader 的 onError**：需要在 timeline 页面传入：
   ```tsx
   <PhotoUploader photos={photos} onChange={setPhotos} onError={(msg) => toast("error", msg)} />
   ```
   当前 timeline/page.tsx 已在表单中添加了 toast 支持，但 PhotoUploader 的 onError 需要手动连接。在改造后的 timeline page 中搜索 `<PhotoUploader` 添加 `onError` prop 即可。

4. **Timeline authorName 回退**：改造后 TimelineCard 优先使用 `item.author?.nickname`，如果 API 尚未部署新版（即 author 为空），会回退到 `couple.users.find()` 逻辑。
