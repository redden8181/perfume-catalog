import { getParseApiKey } from "./integrations";

export interface PhotoSuggestion {
  id: string;
  name: string;
  brand: string;
  year: number | null;
  imageUrl: string;
  thumbnailUrl: string;
}

const SEARCH_ENDPOINT =
  "https://api.parse.bot/scraper/d2c369a4-db4f-46ae-829d-562361126109/search_perfumes";

const IMG_PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://api.cors.lol/?url=${encodeURIComponent(u)}`,
];

function upscaleFragranticaImage(thumbnail: string, id: string): string {
  if (thumbnail.includes("fimgs.net")) {
    return `https://fimgs.net/mdimg/perfume/375x500.${id}.jpg`;
  }
  return thumbnail;
}

export async function searchPerfumePhotos(query: string): Promise<PhotoSuggestion[]> {
  const apiKey = getParseApiKey();
  if (!apiKey) {
    throw new Error("Сначала добавьте Parse API Key в Настройках → Интеграции");
  }

  const url = `${SEARCH_ENDPOINT}?page=0&limit=8&query=${encodeURIComponent(query)}`;
  const resp = await fetch(url, {
    headers: { "X-API-Key": apiKey },
  });

  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Неверный Parse API Key");
    }
    throw new Error(`Ошибка поиска фото (${resp.status})`);
  }

  const json = await resp.json() as {
    data?: {
      hits?: Array<{
        id: number | string;
        naslov?: string;
        dizajner?: string;
        godina?: number;
        thumbnail?: string;
      }>;
    };
  };

  const hits = json.data?.hits ?? [];
  return hits
    .filter((h) => h.thumbnail && h.naslov)
    .map((h) => {
      const id = String(h.id);
      return {
        id,
        name: h.naslov ?? "",
        brand: h.dizajner ?? "",
        year: typeof h.godina === "number" ? h.godina : null,
        thumbnailUrl: h.thumbnail ?? "",
        imageUrl: upscaleFragranticaImage(h.thumbnail ?? "", id),
      };
    });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

async function resizeDataUrl(dataUrl: string, maxSize: number): Promise<string> {
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = rej;
      el.src = dataUrl;
    });
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    if (scale >= 1 && dataUrl.length < 450_000) return dataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.88);
  } catch {
    return dataUrl;
  }
}

/**
 * Загружает выбранное фото и возвращает dataURL для офлайн-хранения.
 * Если CORS блочит — пробуем прокси, иначе в крайнем случае вернём исходный URL.
 */
export async function downloadSuggestionImage(url: string): Promise<string> {
  try {
    const resp = await fetch(url, { mode: "cors" });
    if (resp.ok) {
      return await resizeDataUrl(await blobToDataUrl(await resp.blob()), 720);
    }
  } catch {
    /* try proxies */
  }

  for (const proxy of IMG_PROXIES) {
    try {
      const resp = await fetch(proxy(url));
      if (resp.ok) {
        return await resizeDataUrl(await blobToDataUrl(await resp.blob()), 720);
      }
    } catch {
      /* next */
    }
  }

  // Последний fallback — сам URL (если браузер сможет показать, пусть покажет)
  return url;
}
