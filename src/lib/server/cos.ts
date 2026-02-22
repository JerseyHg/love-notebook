import crypto from "crypto";

const SECRET_ID = process.env.COS_SECRET_ID || "";
const SECRET_KEY = process.env.COS_SECRET_KEY || "";
const BUCKET = process.env.COS_BUCKET || "";
const REGION = process.env.COS_REGION || "ap-shanghai";

export const COS_HOST = `${BUCKET}.cos.${REGION}.myqcloud.com`;
export const useCOS = !!(SECRET_ID && SECRET_KEY && BUCKET);

function hmacSha1(key: string, data: string): string {
  return crypto.createHmac("sha1", key).update(data).digest("hex");
}

function sha1(data: string): string {
  return crypto.createHash("sha1").update(data).digest("hex");
}

/**
 * 生成 COS 签名（通用方法）
 */
function generateAuthorization(
  method: "get" | "put",
  filePath: string,
  ttlSeconds: number
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds;
  const keyTime = `${now};${exp}`;
  const signKey = hmacSha1(SECRET_KEY, keyTime);

  const httpString = `${method}\n/${filePath}\n\nhost=${COS_HOST}\n`;
  const sha1edHttpString = sha1(httpString);
  const stringToSign = `sha1\n${keyTime}\n${sha1edHttpString}\n`;
  const signature = hmacSha1(signKey, stringToSign);

  return [
    `q-sign-algorithm=sha1`,
    `q-ak=${SECRET_ID}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=host`,
    `q-url-param-list=`,
    `q-signature=${signature}`,
  ].join("&");
}

/**
 * 生成 COS 上传临时签名（PUT，15分钟有效）
 */
export function generateUploadSignature(filePath: string) {
  const authorization = generateAuthorization("put", filePath, 900);
  return {
    authorization,
    url: `https://${COS_HOST}/${filePath}`,
    expiredAt: Math.floor(Date.now() / 1000) + 900,
  };
}

/**
 * 生成 COS 下载签名 URL（GET，1小时有效）
 */
export function generateSignedUrl(filePath: string): string {
  const authorization = generateAuthorization("get", filePath, 3600);
  return `https://${COS_HOST}/${filePath}?${authorization}`;
}

/**
 * 批量生成签名 URL
 * 对于非 COS 链接直接返回原 URL
 */
export function batchSignUrls(urls: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const url of urls) {
    if (url.includes(COS_HOST)) {
      try {
        const filePath = new URL(url).pathname.slice(1);
        result[url] = generateSignedUrl(filePath);
      } catch {
        result[url] = url;
      }
    } else {
      result[url] = url;
    }
  }

  return result;
}

/**
 * 生成唯一文件路径
 */
export function generateFilePath(
  originalName: string,
  folder = "photos"
): string {
  const ext = originalName.split(".").pop() || "jpg";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(8).toString("hex");
  return `${folder}/${date}/${random}.${ext}`;
}
