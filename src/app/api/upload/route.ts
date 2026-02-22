import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { useCOS, generateFilePath, COS_HOST } from "@/lib/server/cos";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

/**
 * ✅ 修复签名重复问题：
 * COS 上传统一使用 cos.ts 生成的签名 + fetch PUT，
 * 不再单独实例化 cos-nodejs-sdk-v5 SDK。
 *
 * 好处：
 * 1. 签名逻辑只在 cos.ts 一个地方维护
 * 2. 不再引入 cos-nodejs-sdk-v5 的 putObject，减少依赖
 */

/**
 * 压缩图片：最大宽度 1920px，JPEG 质量 85%
 * ✅ 只调用一次
 */
async function compressImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    console.warn("Image compression failed, using original");
    return buffer;
  }
}

/**
 * 通过签名 URL + fetch PUT 上传到 COS
 * 统一使用 cos.ts 的签名方法
 */
async function uploadToCOS(buffer: Buffer, filePath: string, contentType: string): Promise<string> {
  // 动态 import cos.ts 的签名方法
  const { generateUploadSignature } = await import("@/lib/server/cos");
  const { authorization, url } = generateUploadSignature(filePath);

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      "Content-Type": contentType,
      Host: COS_HOST,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`COS upload failed: ${res.status} ${text}`);
  }

  return `https://${COS_HOST}/${filePath}`;
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "只支持图片文件" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "图片不能超过 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // ✅ 只压缩一次
    const buffer = await compressImage(rawBuffer);

    let url: string;

    if (useCOS) {
      // ✅ 使用 cos.ts 统一的文件路径生成 + 签名上传
      const filePath = generateFilePath(file.name);
      url = await uploadToCOS(buffer, filePath, "image/jpeg");
    } else {
      // 本地存储 fallback
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const hash = crypto.randomBytes(8).toString("hex");
      const fileName = `${date}_${hash}.jpg`;

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      url = `/uploads/${fileName}`;
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上传失败" },
      { status: 500 }
    );
  }
}
