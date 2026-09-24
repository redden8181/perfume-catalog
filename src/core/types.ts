/**
 * Доменные модели каталога парфюмерии.
 * Этот слой не зависит от UI и хранилища.
 */

export type Gender = "male" | "female" | "unisex";

export type NoteLayer = "top" | "heart" | "base";

export type NotePreference = "like" | "dislike" | "neutral";

/** Парфюмерная нота — единая сущность базы (Малина ≠ малина, но совпадает по ключу) */
export interface Note {
  id: string;
  name: string;
  /** Миниатюра ноты (dataURL) */
  image: string | null;
  /** Отношение к ноте */
  preference: NotePreference;
  createdAt: number;
}

/** Ноты парфюма по пирамиде: id нот */
export interface PerfumeNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Perfume {
  id: string;
  brand: string;
  name: string;
  gender: Gender;
  year: number | null;
  /** dataURL или относительный путь к изображению */
  image: string | null;
  notes: PerfumeNotes;
  description: string;
  /** Дополнительные характеристики: стойкость, шлейф, сезон... */
  characteristics: string;
  /** Личные заметки владельца каталога */
  personalNotes: string;
  /** 0–5 */
  rating: number;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

/** Черновик парфюма без служебных полей — используется формой добавления/редактирования */
export type PerfumeDraft = Omit<Perfume, "id" | "createdAt" | "updatedAt">;

/** Полный снимок каталога (то, что хранится и экспортируется) */
export interface CatalogSnapshot {
  notes: Note[];
  perfumes: Perfume[];
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Мужской",
  female: "Женский",
  unisex: "Унисекс",
};

export const GENDER_SHORT: Record<Gender, string> = {
  male: "Муж",
  female: "Жен",
  unisex: "Уни",
};

export const LAYER_LABELS: Record<NoteLayer, string> = {
  top: "Верхние ноты",
  heart: "Средние ноты",
  base: "Базовые ноты",
};

export const LAYER_ORDER: NoteLayer[] = ["top", "heart", "base"];

export function createEmptyDraft(): PerfumeDraft {
  return {
    brand: "",
    name: "",
    gender: "unisex",
    year: null,
    image: null,
    notes: { top: [], heart: [], base: [] },
    description: "",
    characteristics: "",
    personalNotes: "",
    rating: 0,
    favorite: false,
  };
}
