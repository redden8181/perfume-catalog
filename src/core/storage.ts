/**
 * Слой хранения.
 *
 * Сейчас — локальное хранилище браузера (localStorage), данные живут на устройстве
 * и доступны офлайн. Чтобы в будущем перейти на сервер/API, реализуйте этот же
 * интерфейс (например, ApiStorageAdapter) и замените адаптер в catalogStore —
 * UI и бизнес-логика меняться не будут.
 */
export interface StorageAdapter {
  load(): string | null;
  save(raw: string): void;
  clear(): void;
}

const STORAGE_KEY = "aromateka.catalog.v1";

export class LocalStorageAdapter implements StorageAdapter {
  load(): string | null {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  save(raw: string): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, raw);
    } catch (e) {
      // Переполнение квоты (обычно из-за больших фото) — не роняем приложение
      console.warn("[aromateka] не удалось сохранить данные", e);
    }
  }

  clear(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }
}
