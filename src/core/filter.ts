import type {
  Brand,
  Gender,
  Note,
  NoteFilterMode,
  Perfume,
  SortKey,
} from "./types";
import { normalizeName } from "./utils";

/** Состояние фильтров каталога. */
export interface PerfumeFilters {
  query: string;
  noteIds: string[];
  noteMode: NoteFilterMode;
  brandId: string | null;
  genders: Gender[];
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number;
  favoritesOnly: boolean;
}

export const EMPTY_FILTERS: PerfumeFilters = {
  query: "",
  noteIds: [],
  noteMode: "all",
  brandId: null,
  genders: [],
  yearFrom: null,
  yearTo: null,
  minRating: 0,
  favoritesOnly: false,
};

/** Все ноты парфюма (верх + сердце + база), без повторов. */
export function allNoteIds(perfume: Perfume): string[] {
  return Array.from(
    new Set([...perfume.notes.top, ...perfume.notes.heart, ...perfume.notes.base]),
  );
}

/**
 * Ключевая логика приложения:
 *  mode "all" — парфюм должен содержать КАЖДУЮ выбранную ноту;
 *  mode "any" — достаточно ЛЮБОЙ из выбранных нот.
 */
export function matchesNotes(
  perfume: Perfume,
  noteIds: string[],
  mode: NoteFilterMode,
): boolean {
  if (noteIds.length === 0) return true;
  const have = new Set(allNoteIds(perfume));
  if (mode === "all") return noteIds.every((id) => have.has(id));
  return noteIds.some((id) => have.has(id));
}

/** Текст для полнотекстового поиска: название + бренд + ноты. */
export function buildSearchText(
  perfume: Perfume,
  brandName: string,
  noteNames: string[],
): string {
  return normalizeName([perfume.name, brandName, ...noteNames].join(" "));
}

export interface FilterContext {
  notesById: Map<string, Note>;
  brandsById: Map<string, Brand>;
}

export function buildFilterContext(notes: Note[], brands: Brand[]): FilterContext {
  return {
    notesById: new Map(notes.map((n) => [n.id, n])),
    brandsById: new Map(brands.map((b) => [b.id, b])),
  };
}

export function applyFilters(
  perfumes: Perfume[],
  filters: PerfumeFilters,
  ctx: FilterContext,
): Perfume[] {
  const q = normalizeName(filters.query);
  return perfumes.filter((p) => {
    if (filters.favoritesOnly && !p.favorite) return false;
    if (filters.brandId && p.brandId !== filters.brandId) return false;
    if (filters.genders.length > 0 && !filters.genders.includes(p.gender)) return false;
    if (filters.minRating > 0 && p.rating < filters.minRating) return false;
    if (filters.yearFrom !== null && (p.year === null || p.year < filters.yearFrom)) return false;
    if (filters.yearTo !== null && (p.year === null || p.year > filters.yearTo)) return false;
    if (!matchesNotes(p, filters.noteIds, filters.noteMode)) return false;

    if (q) {
      const brandName = ctx.brandsById.get(p.brandId)?.name ?? "";
      const noteNames = allNoteIds(p)
        .map((id) => ctx.notesById.get(id)?.name ?? "")
        .filter(Boolean);
      const haystack = buildSearchText(p, brandName, noteNames);
      const words = q.split(" ").filter(Boolean);
      if (!words.every((w) => haystack.includes(w))) return false;
    }
    return true;
  });
}

export function sortPerfumes(list: Perfume[], key: SortKey): Perfume[] {
  const sorted = [...list];
  switch (key) {
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating || b.updatedAt - a.updatedAt);
      break;
    case "year":
      sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ru-RU"));
      break;
    case "updated":
    default:
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  return sorted;
}

/** Число активных «дополнительных» фильтров (без поиска и нот — они видны чипами). */
export function countActiveFilters(f: PerfumeFilters): number {
  let n = 0;
  if (f.brandId) n++;
  if (f.genders.length > 0) n++;
  if (f.yearFrom !== null || f.yearTo !== null) n++;
  if (f.minRating > 0) n++;
  if (f.favoritesOnly) n++;
  return n;
}
