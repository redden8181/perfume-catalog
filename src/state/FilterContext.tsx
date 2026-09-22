import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createEmptyQuery, type FilterQuery } from "../core/filter";

/**
 * Состояние фильтров каталога — это состояние UI, а не данных,
 * поэтому живёт отдельно от CatalogStore. Сохраняется между визитами
 * (кроме строки поиска), чтобы приложение открывалось «где закончили».
 */

const UI_KEY = "aromateka.filters.v1";

interface FilterContextValue {
  query: FilterQuery;
  patch: (p: Partial<FilterQuery>) => void;
  toggleNote: (id: string) => void;
  removeNote: (id: string) => void;
  clearNotes: () => void;
  /** Установить фильтр на конкретный набор нот (например, клик по ноте в карточке) */
  setNotes: (ids: string[]) => void;
  /** Сбросить всё, включая ноты и поиск */
  resetAll: () => void;
  /** Сбросить только «продвинутые» фильтры (бренды/пол/год/рейтинг/избранное), ноты и поиск остаются */
  resetAdvanced: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function loadInitial(): FilterQuery {
  const empty = createEmptyQuery();
  try {
    const raw = window.localStorage.getItem(UI_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<FilterQuery>;
    return {
      ...empty,
      noteIds: Array.isArray(parsed.noteIds) ? parsed.noteIds : [],
      matchMode: parsed.matchMode === "any" ? "any" : "all",
      sort:
        parsed.sort === "name" || parsed.sort === "rating" || parsed.sort === "year"
          ? parsed.sort
          : "updated",
    };
  } catch {
    return empty;
  }
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState<FilterQuery>(loadInitial);

  useEffect(() => {
    try {
      const { search: _search, ...rest } = query;
      window.localStorage.setItem(UI_KEY, JSON.stringify(rest));
    } catch {
      /* noop */
    }
  }, [query]);

  const patch = useCallback(
    (p: Partial<FilterQuery>) => setQuery((q) => ({ ...q, ...p })),
    []
  );

  const toggleNote = useCallback((id: string) => {
    setQuery((q) => ({
      ...q,
      noteIds: q.noteIds.includes(id)
        ? q.noteIds.filter((n) => n !== id)
        : [...q.noteIds, id],
    }));
  }, []);

  const removeNote = useCallback((id: string) => {
    setQuery((q) => ({ ...q, noteIds: q.noteIds.filter((n) => n !== id) }));
  }, []);

  const clearNotes = useCallback(() => setQuery((q) => ({ ...q, noteIds: [] })), []);

  const setNotes = useCallback(
    (ids: string[]) => setQuery((q) => ({ ...q, noteIds: ids })),
    []
  );

  const resetAll = useCallback(() => setQuery(createEmptyQuery()), []);

  const resetAdvanced = useCallback(
    () =>
      setQuery((q) => ({
        ...q,
        brands: [],
        genders: [],
        yearFrom: null,
        yearTo: null,
        minRating: 0,
        favoritesOnly: false,
      })),
    []
  );

  const value = useMemo<FilterContextValue>(
    () => ({
      query,
      patch,
      toggleNote,
      removeNote,
      clearNotes,
      setNotes,
      resetAll,
      resetAdvanced,
    }),
    [query, patch, toggleNote, removeNote, clearNotes, setNotes, resetAll, resetAdvanced]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters должен использоваться внутри FilterProvider");
  return ctx;
}
