"use client";

import { useState, useCallback } from "react";
import { MapPin, Loader2, X, Navigation } from "lucide-react";

export interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  onError?: (message: string) => void;
}

/**
 * 位置选择器
 * - 点击获取当前 GPS 定位
 * - 通过 Nominatim 反向地理编码获取地名（免费，无需 API Key）
 * - 支持手动输入地名覆盖
 */
export function LocationPicker({ value, onChange, onError }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [manualName, setManualName] = useState("");

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      onError?.("您的浏览器不支持定位功能");
      return;
    }

    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // 缓存 1 分钟
          });
        }
      );

      const { latitude: lat, longitude: lng } = position.coords;

      // 反向地理编码 - 获取地名
      let name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-CN&zoom=16`,
          { headers: { "User-Agent": "LoveNotebook/1.0" } }
        );
        if (res.ok) {
          const data = await res.json();
          // 优先用 road/neighbourhood，再用 suburb/city
          const addr = data.address || {};
          const parts = [
            addr.road || addr.neighbourhood || addr.hamlet || "",
            addr.suburb || addr.district || addr.town || "",
            addr.city || addr.county || "",
          ].filter(Boolean);
          if (parts.length > 0) {
            name = parts.slice(0, 2).join(" · ");
          } else if (data.display_name) {
            // 取 display_name 的前两段
            const segments = data.display_name.split(",").map((s: string) => s.trim());
            name = segments.slice(0, 2).join(" · ");
          }
        }
      } catch {
        // 反向地理编码失败，用坐标作为 fallback
      }

      onChange({ lat, lng, name });
    } catch (err) {
      const geoErr = err as GeolocationPositionError;
      switch (geoErr.code) {
        case geoErr.PERMISSION_DENIED:
          onError?.("定位权限被拒绝，请在浏览器设置中允许");
          break;
        case geoErr.POSITION_UNAVAILABLE:
          onError?.("无法获取位置信息");
          break;
        case geoErr.TIMEOUT:
          onError?.("定位超时，请重试");
          break;
        default:
          onError?.("定位失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  }, [onChange, onError]);

  const handleManualSubmit = () => {
    if (manualName.trim() && value) {
      onChange({ ...value, name: manualName.trim() });
    }
    setEditing(false);
    setManualName("");
  };

  // 已有位置
  if (value) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-primary-50,#eef3f5)] border border-[var(--color-primary-100,#dce7eb)]">
        <MapPin size={14} className="text-[var(--color-primary,#5a7d8a)] flex-shrink-0" />

        {editing ? (
          <input
            autoFocus
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            onBlur={handleManualSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleManualSubmit();
              if (e.key === "Escape") { setEditing(false); setManualName(""); }
            }}
            placeholder="输入地点名称"
            className="flex-1 text-xs bg-transparent border-none outline-none text-[var(--color-text,#1a2332)] placeholder:text-[var(--color-text-muted,#8a95a0)]"
          />
        ) : (
          <span
            onClick={() => { setEditing(true); setManualName(value.name); }}
            className="flex-1 text-xs text-[var(--color-text-secondary,#5c6b7a)] cursor-pointer hover:underline truncate"
            title="点击修改地点名称"
          >
            {value.name}
          </span>
        )}

        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[var(--color-text-muted,#8a95a0)] hover:text-[var(--color-error,#7a5c5c)] transition-colors flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // 未选择位置
  return (
    <button
      type="button"
      onClick={getLocation}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[var(--color-border,#d4dae0)]
        text-[var(--color-text-muted,#8a95a0)] hover:border-[var(--color-primary,#5a7d8a)] hover:text-[var(--color-primary,#5a7d8a)]
        transition-colors text-xs disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>定位中...</span>
        </>
      ) : (
        <>
          <Navigation size={14} />
          <span>添加位置</span>
        </>
      )}
    </button>
  );
}
