/** Генерация id (UUID с запасным вариантом) */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Нормализация введённого названия ноты: схлопываем пробелы */
export function normalizeNoteName(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/** Ключ сравнения нот — «Малина» и «малина» дают одинаковый ключ */
export function noteKey(name: string): string {
  return normalizeNoteName(name).toLocaleLowerCase("ru");
}

/** Отображаемое имя ноты: первая буква заглавная */
export function displayNoteName(name: string): string {
  const n = normalizeNoteName(name);
  if (!n) return n;
  return n.charAt(0).toLocaleUpperCase("ru") + n.slice(1);
}

/** Склонение: 1 аромат, 2 аромата, 5 ароматов */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (d > 1 && d < 5) return few;
  if (d === 1) return one;
  return many;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
