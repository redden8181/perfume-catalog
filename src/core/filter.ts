import type { Gender, Perfume } from "./types";

/**
 * Чистые функции фильтрации и поиска — не зависят от UI и хранилища,
 * легко тестируются и переиспользуются.
 */

export type MatchMode = "all" | "any";
export type SortMode = "updated" | "name" | "rating" | "year";

export interface FilterQuery {
  search: string;
  /** Выбранные ноты */
  noteIds: string[];
  /** all = содержит ВСЕ выбранные ноты; any = ЛЮБУЮ из выбранных */
  matchMode: MatchMode;
  brands: string[];
  genders: Gender[];
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number;
  favoritesOnly: boolean;
  sort: SortMode;
}

export function createEmptyQuery(): FilterQuery {
  return {
    search: "",
    noteIds: [],
    matchMode: "all",
    brands: [],
    genders: [],
    yearFrom: null,
    yearTo: null,
    minRating: 0,
    favoritesOnly: false,
    sort: "updated",
  };
}

/** Все ноты парфюма из трёх уровней пирамиды, без повторов, в порядке верх→сердце→база */
export function perfumeAllNoteIds(p: Perfume): string[] {
  return Array.from(new Set([...p.notes.top, ...p.notes.heart, ...p.notes.base]));
}

export function applyQuery(
  perfumes: Perfume[],
  q: FilterQuery,
  noteName: (id: string) => string | undefined
): Perfume[] {
  const search = q.search.trim().toLocaleLowerCase("ru");

  const list = perfumes.filter((p) => {
    if (q.favoritesOnly && !p.favorite) return false;
    if (q.genders.length > 0 && !q.genders.includes(p.gender)) return false;
    if (q.brands.length > 0 && !q.brands.includes(p.brand)) return false;
    if (p.rating < q.minRating) return false;
    if (q.yearFrom != null && (p.year == null || p.year < q.yearFrom)) return false;
    if (q.yearTo != null && (p.year == null || p.year > q.yearTo)) return false;

    if (q.noteIds.length > 0) {
      const own = perfumeAllNoteIds(p);
      const has = (nid: string) => own.includes(nid);
      const ok = q.matchMode === "all" ? q.noteIds.every(has) : q.noteIds.some(has);
      if (!ok) return false;
    }

    if (search) {
      const haystack = [
        p.name,
        p.brand,
        ...perfumeAllNoteIds(p).map((id) => noteName(id) ?? ""),
      ]
        .join(" ")
        .toLocaleLowerCase("ru");
      if (!haystack.includes(search)) return false;
    }

    return true;
  });

  const sorted = [...list];
  switch (q.sort) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ru"));
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating || b.updatedAt - a.updatedAt);
      break;
    case "year":
      sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      break;
    default:
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  return sorted;
}

/** Количество активных «продвинутых» фильтров (для бейджа на кнопке) */
export function countAdvancedFilters(q: FilterQuery): number {
  let n = 0;
  if (q.favoritesOnly) n += 1;
  if (q.brands.length > 0) n += 1;
  if (q.genders.length > 0) n += 1;
  if (q.minRating > 0) n += 1;
  if (q.yearFrom != null || q.yearTo != null) n += 1;
  return n;
}
