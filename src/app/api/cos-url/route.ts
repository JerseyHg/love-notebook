import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import crypto from "crypto";

const COS_SECRET_ID = process.env.COS_SECRET_ID || "";
const COS_SECRET_KEY = process.env.COS_SECRET_KEY || "";
const COS_BUCKET = process.env.COS_BUCKET || "";
const COS_REGION = process.env.COS_REGION || "ap-shanghai";

function generateSignedUrl(filePath: string): string {
    const host = `${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1 小时有效
    const keyTime = `${now};${exp}`;

    const signKey = crypto.createHmac("sha1", COS_SECRET_KEY).update(keyTime).digest("hex");

    const httpString = `get\n/${filePath}\n\nhost=${host}\n`;
    const sha1ed = crypto.createHash("sha1").update(httpString).digest("hex");
    const stringToSign = `sha1\n${keyTime}\n${sha1ed}\n`;
    const signature = crypto.createHmac("sha1", signKey).update(stringToSign).digest("hex");

    const authorization = [
        `q-sign-algorithm=sha1`,
        `q-ak=${COS_SECRET_ID}`,
        `q-sign-time=${keyTime}`,
        `q-key-time=${keyTime}`,
        `q-header-list=host`,
        `q-url-param-list=`,
        `q-signature=${signature}`,
    ].join("&");

    return `https://${host}/${filePath}?${authorization}`;
}

export async function POST(req: NextRequest) {
    try {
        await requireAuth();
        const { urls } = await req.json();

        if (!Array.isArray(urls)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const host = `${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`;
        const signedUrls: Record<string, string> = {};

        for (const url of urls) {
            // 从完整 URL 中提取文件路径
            if (url.includes(host)) {
                const filePath = new URL(url).pathname.slice(1); // 去掉开头的 /
                signedUrls[url] = generateSignedUrl(filePath);
            } else {
                signedUrls[url] = url; // 本地文件不需要签名
            }
        }

        return NextResponse.json({ signedUrls });
    } catch {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}