"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { ImageOrPlaceholder } from "./ImageOrPlaceholder";

const MAX_SIDE = 900;

/** Уменьшает фото до разумного размера и возвращает data URL (JPEG). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas unsupported");
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось прочитать изображение"));
    };
    img.src = url;
  });
}

export function ImagePicker({
  value,
  onChange,
  seed,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  seed: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Не удалось обработать фото. Попробуйте другой файл.");
    }
  };

  return (
    <div className="flex items-start gap-4">
      <ImageOrPlaceholder
        src={value}
        seed={seed || "photo"}
        label="Фото флакона"
        className="relative flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface"
        imgClassName="h-28 w-24 shrink-0 rounded-2xl border border-line object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 pt-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line-2 bg-surface px-4 text-sm font-semibold text-ivory transition-colors active:bg-surface-2"
        >
          <ImagePlus className="h-5 w-5 text-gold" />
          {value ? "Заменить фото" : "Загрузить фото"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-wine transition-colors active:bg-wine/10"
          >
            <Trash2 className="h-4 w-4" />
            Убрать
          </button>
        )}
        <p className="text-xs leading-relaxed text-faint">
          Фото уменьшается до {MAX_SIDE}px и хранится локально вместе с каталогом.
        </p>
        {error && <p className="text-xs font-medium text-wine">{error}</p>}
      </div>
    </div>
  );
}
