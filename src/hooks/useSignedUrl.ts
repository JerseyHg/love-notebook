"use client";

import { useState, useEffect } from "react";

const cache = new Map<string, { url: string; expiry: number }>();

export function useSignedUrls(urls: string[]) {
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        if (urls.length === 0) return;

        const now = Date.now();
        const needSign: string[] = [];
        const cached: Record<string, string> = {};

        for (const url of urls) {
            const entry = cache.get(url);
            if (entry && entry.expiry > now) {
                cached[url] = entry.url;
            } else if (url.includes(".cos.")) {
                needSign.push(url);
            } else {
                cached[url] = url;
            }
        }

        if (needSign.length === 0) {
            setSignedUrls(cached);
            return;
        }

        fetch("/api/cos-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: needSign }),
        })
            .then((res) => res.json())
            .then((data) => {
                const expiry = now + 50 * 60 * 1000; // 缓存 50 分钟
                for (const [original, signed] of Object.entries(data.signedUrls)) {
                    cache.set(original, { url: signed as string, expiry });
                    cached[original] = signed as string;
                }
                setSignedUrls(cached);
            })
            .catch(() => setSignedUrls(cached));
    }, [urls.join(",")]);

    return signedUrls;
}