import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import COS from "cos-nodejs-sdk-v5";
import sharp from "sharp";

const COS_SECRET_ID = process.env.COS_SECRET_ID || "";
const COS_SECRET_KEY = process.env.COS_SECRET_KEY || "";
const COS_BUCKET = process.env.COS_BUCKET || "";
const COS_REGION = process.env.COS_REGION || "ap-shanghai";

const useCOS = !!(COS_SECRET_ID && COS_SECRET_KEY && COS_BUCKET);

const cos = useCOS
    ? new COS({ SecretId: COS_SECRET_ID, SecretKey: COS_SECRET_KEY })
    : null;

function uploadToCOS(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const key = `photos/${fileName}`;
    cos!.putObject(
        {
          Bucket: COS_BUCKET,
          Region: COS_REGION,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        },
        (err) => {
          if (err) {
            reject(new Error(`COS upload failed: ${err.message}`));
          } else {
            const url = `https://${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com/${key}`;
            resolve(url);
          }
        }
    );
  });
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

    const ext = "jpg";
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const hash = crypto.randomBytes(8).toString("hex");
    const fileName = `${date}_${hash}.${ext}`;

    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);

    // 压缩图片：最大宽度 1920px，JPEG 质量 85%
    try {
      buffer = await sharp(buffer)
          .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer() as Buffer;
    } catch {
      // 压缩失败就用原图
    }
    // 压缩图片：最大宽度 1920px，JPEG 质量 85%
    try {
      buffer = await sharp(buffer)
          .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
    } catch {
      // 压缩失败就用原图
    }

    let url: string;

    if (useCOS && cos) {
      url = await uploadToCOS(buffer, fileName, file.type);
    } else {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);
      url = `/uploads/${fileName}`;
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}