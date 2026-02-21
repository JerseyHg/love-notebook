// 腾讯云 COS 上传辅助工具
// 使用临时签名 URL 的方式，前端直传 COS

import crypto from "crypto";

const SECRET_ID = process.env.COS_SECRET_ID || "";
const SECRET_KEY = process.env.COS_SECRET_KEY || "";
const BUCKET = process.env.COS_BUCKET || "";
const REGION = process.env.COS_REGION || "ap-guangzhou";

function hmacSha1(key: string, data: string): string {
  return crypto.createHmac("sha1", key).update(data).digest("hex");
}

/**
 * 生成 COS 上传临时签名
 * 前端拿到签名后可直接 PUT 上传到 COS
 */
export function generateCOSSignature(filePath: string) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 900; // 15 分钟有效

  const keyTime = `${now};${exp}`;
  const signKey = hmacSha1(SECRET_KEY, keyTime);

  const httpString = `put\n/${filePath}\n\nhost=${BUCKET}.cos.${REGION}.myqcloud.com\n`;
  const sha1edHttpString = crypto
    .createHash("sha1")
    .update(httpString)
    .digest("hex");

  const stringToSign = `sha1\n${keyTime}\n${sha1edHttpString}\n`;
  const signature = hmacSha1(signKey, stringToSign);

  const authorization = [
    `q-sign-algorithm=sha1`,
    `q-ak=${SECRET_ID}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=host`,
    `q-url-param-list=`,
    `q-signature=${signature}`,
  ].join("&");

  return {
    authorization,
    url: `https://${BUCKET}.cos.${REGION}.myqcloud.com/${filePath}`,
    expiredAt: exp,
  };
}

/**
 * 生成唯一文件路径
 */
export function generateFilePath(
  originalName: string,
  folder: string = "photos"
): string {
  const ext = originalName.split(".").pop() || "jpg";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(8).toString("hex");
  return `${folder}/${date}/${random}.${ext}`;
}
