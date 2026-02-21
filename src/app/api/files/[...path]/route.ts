import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/**
 * 图片文件服务 API
 * 通过 /api/files/uploads/xxx.jpg 访问上传的图片
 * 避免依赖 Next.js 对 public/ 目录的静态文件服务
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const segments = (await params).path;
    // 安全检查：防止路径穿越
    if (segments.some((s) => s === ".." || s.includes("\\"))) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", ...segments);

    // 检查文件是否存在
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(filePath).slice(1).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
