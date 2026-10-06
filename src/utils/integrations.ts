/**
 * Ключи интеграций (хранятся локально только у владельца приложения).
 * Сейчас используем Parse API key для поиска каталожных фото парфюмов.
 */

const KEY = "aromateka.integrations.v1";

interface IntegrationState {
  parseApiKey: string;
}

function readState(): IntegrationState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { parseApiKey: "" };
    const parsed = JSON.parse(raw) as Partial<IntegrationState>;
    return {
      parseApiKey: typeof parsed.parseApiKey === "string" ? parsed.parseApiKey : "",
    };
  } catch {
    return { parseApiKey: "" };
  }
}

function writeState(next: IntegrationState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

export function getParseApiKey(): string {
  return readState().parseApiKey;
}

export function setParseApiKey(value: string): void {
  writeState({ parseApiKey: value.trim() });
}
