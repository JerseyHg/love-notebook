"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useSignedUrls } from "@/hooks/useSignedUrl";

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

export function PhotoUploader({
  photos,
  onChange,
  max = 9,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
    const signedUrls = useSignedUrls(photos);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = max - photos.length;
      if (remaining <= 0) return;

      const toUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      try {
        const uploaded: string[] = [];

        for (const file of toUpload) {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              uploaded.push(data.url);
            }
          }
        }

        onChange([...photos, ...uploaded]);
      } catch {
        /* ignore */
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [photos, onChange, max]
  );

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">
      {/* 已选图片预览 */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-[#eef1f3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={signedUrls[url] || url}
                    alt={`照片 ${index + 1}`}
                    className="w-full h-full object-cover"
                />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center
                  text-white hover:bg-black/60 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {photos.length < max && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 py-6 rounded-xl
            border-2 border-dashed border-[#d4dae0] cursor-pointer
            hover:border-[#5a7d8a] hover:bg-[#eef1f3] transition-all duration-250
            ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <ImagePlus size={24} className="text-[#5a7d8a]" strokeWidth={1.5} />
          <span className="text-xs text-[#8a95a0]">
            {uploading
              ? "上传中..."
              : `点击或拖拽添加照片（${photos.length}/${max}）`}
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
