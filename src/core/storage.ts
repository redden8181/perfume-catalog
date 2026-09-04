import type { CatalogData } from "./types";

/**
 * Слой хранения. Приложение зависит только от интерфейса CatalogStorage,
 * поэтому локальное хранилище можно в будущем заменить на API/БД,
 * не трогая остальной код:
 *
 *   export function getCatalogStorage(): CatalogStorage {
 *     return new ApiCatalogStorage("/api/catalog"); // ← одна замена
 *   }
 */
export interface CatalogStorage {
  readonly kind: string;
  load(): Promise<CatalogData | null>;
  save(data: CatalogData): Promise<void>;
  clear(): Promise<void>;
}

const STORAGE_KEY = "aromateka.catalog.v1";

function hasWindow(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Локальное хранилище браузера — реализация по умолчанию. */
export class LocalCatalogStorage implements CatalogStorage {
  readonly kind = "localStorage";

  async load(): Promise<CatalogData | null> {
    if (!hasWindow()) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CatalogData;
      if (!parsed || !Array.isArray(parsed.perfumes)) return null;
      return parsed;
    } catch (error) {
      console.error("[storage] Не удалось прочитать каталог:", error);
      return null;
    }
  }

  async save(data: CatalogData): Promise<void> {
    if (!hasWindow()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      // Переполнение квоты (много тяжёлых фото) и т.п.
      console.error("[storage] Не удалось сохранить каталог:", error);
    }
  }

  async clear(): Promise<void> {
    if (!hasWindow()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Заготовка под будущий бэкенд. Сигнатура интерфейса не изменится —
 * поменяется только транспорт.
 */
export class ApiCatalogStorage implements CatalogStorage {
  readonly kind = "api";
  constructor(private readonly baseUrl: string) {}

  async load(): Promise<CatalogData | null> {
    const res = await fetch(`${this.baseUrl}/catalog`);
    if (!res.ok) return null;
    return (await res.json()) as CatalogData;
  }

  async save(data: CatalogData): Promise<void> {
    await fetch(`${this.baseUrl}/catalog`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async clear(): Promise<void> {
    await fetch(`${this.baseUrl}/catalog`, { method: "DELETE" });
  }
}

/** Единая точка выбора реализации хранилища. */
export function getCatalogStorage(): CatalogStorage {
  return new LocalCatalogStorage();
}
