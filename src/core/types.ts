/**
 * Доменные типы каталога парфюмерии.
 * Этот слой не знает ничего ни о React, ни о localStorage —
 * его можно переиспользовать с любым хранилищем (локальным или API).
 */

export type Gender = "male" | "female" | "unisex";
export type NoteTier = "top" | "heart" | "base";
export type NoteFilterMode = "all" | "any";
export type ThemeName = "dark" | "light";
export type SortKey = "updated" | "rating" | "year" | "name";

/** Парфюмерная нота — единая сущность в базе. */
export interface Note {
  id: string;
  /** Отображаемое имя, например «Малина». */
  name: string;
  /** Нормализованное имя для дедупликации («малина»). */
  normalized: string;
}

export interface Brand {
  id: string;
  name: string;
  normalized: string;
}

/** Пирамида нот парфюма: id нот по уровням. */
export interface PerfumeNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Perfume {
  id: string;
  brandId: string;
  name: string;
  gender: Gender;
  year: number | null;
  /** data URL (загруженное фото) или путь из /public, например /images/seed-1.jpg */
  image: string | null;
  notes: PerfumeNotes;
  description: string;
  /** Дополнительные характеристики: стойкость, шлейф, сезон и т.п. */
  characteristics: string;
  /** Личные заметки владельца каталога. */
  personalNotes: string;
  /** Рейтинг 0–5 (0 — без оценки). */
  rating: number;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

/** То, что форма передаёт в репозиторий при создании/редактировании. */
export type PerfumeInput = Omit<Perfume, "id" | "createdAt" | "updatedAt">;

export interface CatalogSettings {
  /** Сейчас доступна только тёмная тема, поле готово к расширению. */
  theme: ThemeName;
  /** Режим фильтрации по нотам по умолчанию. */
  noteFilterMode: NoteFilterMode;
}

export interface CatalogMeta {
  createdAt: number;
  /** Признак того, что демо-данные уже добавлялись (чтобы не засевать повторно). */
  seeded: boolean;
}

export interface CatalogData {
  version: number;
  perfumes: Perfume[];
  notes: Note[];
  brands: Brand[];
  settings: CatalogSettings;
  meta: CatalogMeta;
}

export const CATALOG_VERSION = 1;

export const DEFAULT_SETTINGS: CatalogSettings = {
  theme: "dark",
  noteFilterMode: "all",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Мужской",
  female: "Женский",
  unisex: "Унисекс",
};

export const TIER_LABELS: Record<NoteTier, string> = {
  top: "Верхние ноты",
  heart: "Ноты сердца",
  base: "Базовые ноты",
};

export const TIER_ORDER: NoteTier[] = ["top", "heart", "base"];

export const SORT_LABELS: Record<SortKey, string> = {
  updated: "Недавно добавленные",
  rating: "По рейтингу",
  year: "По году выпуска",
  name: "По названию",
};
