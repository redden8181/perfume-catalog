/** Утилиты общего назначения. Никакой логики UI-фреймворка. */

/** Генератор id с фолбэком для старых браузеров. */
export function uid(prefix = "id"): string {
  const g = globalThis as { crypto?: Crypto };
  if (g.crypto && typeof g.crypto.randomUUID === "function") {
    return `${prefix}_${g.crypto.randomUUID()}`;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/**
 * Нормализация названия (ноты/бренда) для дедупликации:
 * «  Малина  », «малина» и «МАЛИНА» дают один и тот же ключ.
 */
export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
}

/** Красивое отображаемое имя: первая буква заглавная. */
export function displayName(raw: string): string {
  const clean = raw.trim().replace(/\s+/g, " ");
  if (!clean) return "";
  return clean.charAt(0).toLocaleUpperCase("ru-RU") + clean.slice(1);
}

/** Склейка className без внешних зависимостей. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Детерминированный оттенок 0..360 из строки — для градиентных плейсхолдеров. */
export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

/**
 * basePath для GitHub Pages (например, "/my-repo").
 * В обычном режиме — пустая строка. NEXT_PUBLIC_* инлайнится на этапе сборки.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Префиксует путь из /public значением basePath. */
export function withBase(path: string): string {
  if (!BASE_PATH) return path;
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * data: и http(s) URL отдаём как есть,
 * а локальные файлы из /public — с учётом basePath.
 */
export function resolveImageSrc(src: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return withBase(src);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}
