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
    const exp = now + 3600;
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

export async function GET(req: NextRequest) {
    try {
        await requireAuth();

        const url = req.nextUrl.searchParams.get("url");
        if (!url) {
            return NextResponse.json({ error: "Missing url" }, { status: 400 });
        }

        const host = `${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`;
        if (!url.includes(host)) {
            return NextResponse.json({ error: "Invalid url" }, { status: 400 });
        }

        const filePath = new URL(url).pathname.slice(1);
        const signedUrl = generateSignedUrl(filePath);

        const res = await fetch(signedUrl);
        if (!res.ok) {
            return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
        }

        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=3600",
            },
        });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}