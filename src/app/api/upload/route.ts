import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const COS_SECRET_ID = process.env.COS_SECRET_ID || "";
const COS_SECRET_KEY = process.env.COS_SECRET_KEY || "";
const COS_BUCKET = process.env.COS_BUCKET || "";
const COS_REGION = process.env.COS_REGION || "ap-shanghai";

const useCOS = !!(COS_SECRET_ID && COS_SECRET_KEY && COS_BUCKET);

/**
 * 上传到腾讯云 COS
 */
async function uploadToCOS(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const filePath = `photos/${fileName}`;
  const host = `${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`;
  const url = `https://${host}/${filePath}`;

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 900;
  const keyTime = `${now};${exp}`;

  const signKey = crypto.createHmac("sha1", COS_SECRET_KEY).update(keyTime).digest("hex");

  const encodedContentType = encodeURIComponent(contentType).replace(/%[0-9A-F]{2}/g, m => m.toLowerCase());
  const httpString = `put\n/${filePath}\n\ncontent-type=${encodedContentType}&host=${host}\n`;
  const sha1ed = crypto.createHash("sha1").update(httpString).digest("hex");
  const stringToSign = `sha1\n${keyTime}\n${sha1ed}\n`;
  const signature = crypto.createHmac("sha1", signKey).update(stringToSign).digest("hex");

  const authorization = [
    `q-sign-algorithm=sha1`,
    `q-ak=${COS_SECRET_ID}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=content-type;host`,
    `q-url-param-list=`,
    `q-signature=${signature}`,
  ].join("&");

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Host": host,
      "Content-Type": contentType,
      "Authorization": authorization,
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`COS upload failed: ${res.status} ${text}`);
  }

  return url;
}

/**
 * 图片上传
 * - 有 COS 配置时：上传到腾讯云 COS
 * - 无 COS 配置时：存到本地 public/uploads/
 */
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

    const ext = file.name.split(".").pop() || "jpg";
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const hash = crypto.randomBytes(8).toString("hex");
    const fileName = `${date}_${hash}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let url: string;

    if (useCOS) {
      // 生产环境：上传到 COS
      url = await uploadToCOS(buffer, fileName, file.type);
    } else {
      // 本地开发：存到 public/uploads/
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
