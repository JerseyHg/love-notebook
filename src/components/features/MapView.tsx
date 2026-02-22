"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TimelineItem } from "@/types";
import { formatDate, moodMap } from "@/lib/utils";

// Leaflet types (loaded dynamically)
type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;

interface MapViewProps {
  locations: (TimelineItem & {
    location: { lat: number; lng: number; name: string };
  })[];
  currentUserId?: string;
  onSelectItem?: (item: TimelineItem) => void;
  selectedId?: string | null;
}

// 中国中心默认坐标
const DEFAULT_CENTER: [number, number] = [35.86, 104.2];
const DEFAULT_ZOOM = 5;

export function MapView({
  locations,
  currentUserId,
  onSelectItem,
  selectedId,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);

  // 动态加载 Leaflet
  useEffect(() => {
    let cancelled = false;

    async function loadLeaflet() {
      // 注入 Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      const L = await import("leaflet");
      if (!cancelled) {
        setLeaflet(L);
      }
    }

    loadLeaflet();
    return () => { cancelled = true; };
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

    const map = leaflet.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // 使用高德瓦片（中国地区更清晰，且免费）
    leaflet.tileLayer(
      "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
      {
        subdomains: ["1", "2", "3", "4"],
        maxZoom: 18,
      }
    ).addTo(map);

    // 缩放控件放右下角
    leaflet.control.zoom({ position: "bottomright" }).addTo(map);

    // 归属信息
    leaflet.control.attribution({ position: "bottomleft", prefix: "© 高德地图" }).addTo(map);

    mapInstanceRef.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
      setReady(false);
    };
  }, [leaflet]);

  // 创建自定义 marker icon
  const createMarkerIcon = useCallback(
    (isOwn: boolean, isSelected: boolean) => {
      if (!leaflet) return undefined;

      const color = isOwn ? "#5a7d8a" : "#e88d94";
      const size = isSelected ? 36 : 28;
      const pulse = isSelected ? `<span class="marker-pulse" style="border-color:${color}"></span>` : "";

      return leaflet.divIcon({
        className: "custom-marker",
        html: `
          <div style="position:relative;width:${size}px;height:${size}px;">
            ${pulse}
            <svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2C8.48 2 4 6.48 4 12c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10z"
                fill="${color}" stroke="white" stroke-width="2"/>
              <circle cx="14" cy="11" r="3.5" fill="white" opacity="0.9"/>
            </svg>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size + 4],
      });
    },
    [leaflet]
  );

  // 渲染 markers
  useEffect(() => {
    if (!leaflet || !mapInstanceRef.current || !ready) return;

    const map = mapInstanceRef.current;
    const existingIds = new Set(markersRef.current.keys());
    const newIds = new Set(locations.map((l) => l.id));

    // 移除不存在的 marker
    existingIds.forEach((id) => {
      if (!newIds.has(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    });

    // 添加或更新 markers
    locations.forEach((item) => {
      const isOwn = item.authorId === currentUserId;
      const isSelected = item.id === selectedId;
      const icon = createMarkerIcon(isOwn, isSelected);

      if (markersRef.current.has(item.id)) {
        // 更新 icon（选中状态可能变了）
        const marker = markersRef.current.get(item.id)!;
        if (icon) marker.setIcon(icon);
        return;
      }

      // 创建新 marker
      const marker = leaflet
        .marker([item.location.lat, item.location.lng], { icon })
        .addTo(map);

      // Popup 内容
      const mood = item.mood ? moodMap[item.mood] : null;
      const photoHtml = item.photos?.[0]
        ? `<img src="${item.photos[0]}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
        : "";
      const moodHtml = mood ? `<span style="margin-left:4px">${mood.emoji}</span>` : "";

      marker.bindPopup(
        `<div style="min-width:180px;max-width:240px;font-family:system-ui,-apple-system,sans-serif;">
          ${photoHtml}
          <div style="font-size:13px;font-weight:600;color:#1a2332;margin-bottom:4px;">
            ${item.location.name}${moodHtml}
          </div>
          <div style="font-size:12px;color:#5c6b7a;line-height:1.5;margin-bottom:6px;
            display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
            ${item.content}
          </div>
          <div style="font-size:11px;color:#8a95a0;">
            ${formatDate(item.date)}
            · ${item.author?.nickname || "未知"}
          </div>
        </div>`,
        {
          closeButton: false,
          className: "love-popup",
          maxWidth: 260,
        }
      );

      marker.on("click", () => {
        onSelectItem?.(item);
      });

      markersRef.current.set(item.id, marker);
    });

    // Fit bounds
    if (locations.length > 0) {
      const bounds = leaflet.latLngBounds(
        locations.map((l) => [l.location.lat, l.location.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [leaflet, locations, currentUserId, selectedId, ready, createMarkerIcon, onSelectItem]);

  // 选中 item 时 flyTo
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedId) return;
    const item = locations.find((l) => l.id === selectedId);
    if (item) {
      mapInstanceRef.current.flyTo(
        [item.location.lat, item.location.lng],
        Math.max(mapInstanceRef.current.getZoom(), 13),
        { duration: 0.8 }
      );
      // 打开 popup
      const marker = markersRef.current.get(selectedId);
      marker?.openPopup();
    }
  }, [selectedId, locations]);

  return (
    <>
      <style jsx global>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }
        .love-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          padding: 0;
        }
        .love-popup .leaflet-popup-content {
          margin: 12px;
        }
        .love-popup .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid;
          opacity: 0;
          animation: pulse-ring 1.5s ease-out infinite;
        }
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ minHeight: "300px" }}
      />
    </>
  );
}
