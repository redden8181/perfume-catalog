import { useCallback, useMemo, useSyncExternalStore } from "react";
import { catalog } from "../core/catalogStore";
import type { CatalogSnapshot, Note } from "../core/types";
import { perfumeAllNoteIds } from "../core/filter";

/** Подписка на снимок каталога (реактивно) */
export function useCatalog(): CatalogSnapshot {
  return useSyncExternalStore(catalog.subscribe, catalog.getSnapshot);
}

/** Map id → Note */
export function useNotesMap(): Map<string, Note> {
  const { notes } = useCatalog();
  return useMemo(() => new Map(notes.map((n) => [n.id, n])), [notes]);
}

/** Функция-переводчик id ноты в имя */
export function useNoteName(): (id: string) => string | undefined {
  const map = useNotesMap();
  return useCallback((id: string) => map.get(id)?.name, [map]);
}

/** Список брендов, собранный из парфюмов (сущность брендов — производная) */
export function useBrands(): string[] {
  const { perfumes } = useCatalog();
  return useMemo(
    () =>
      Array.from(new Set(perfumes.map((p) => p.brand).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "ru")
      ),
    [perfumes]
  );
}

/** Сколько парфюмов использует каждую ноту: Map noteId → count */
export function useNoteUsage(): Map<string, number> {
  const { perfumes } = useCatalog();
  return useMemo(() => {
    const usage = new Map<string, number>();
    for (const p of perfumes) {
      for (const id of perfumeAllNoteIds(p)) {
        usage.set(id, (usage.get(id) ?? 0) + 1);
      }
    }
    return usage;
  }, [perfumes]);
}
