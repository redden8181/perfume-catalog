import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Plus, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useCatalog, useNoteName, useNotesMap } from "../hooks/useCatalog";
import { useFilters } from "../state/FilterContext";
import { applyQuery, countAdvancedFilters, type SortMode } from "../core/filter";
import { plural } from "../core/utils";
import { PerfumeCard } from "./PerfumeCard";
import { NotePickerSheet } from "./NotePickerSheet";
import { FilterSheet } from "./FilterSheet";
import { Chip, EmptyState, GhostButton, Segmented } from "./ui";

/**
 * Общий сценарий просмотра каталога: поиск + ноты + фильтры + сетка.
 * Используется на главной и в разделе «Избранное».
 */
export function CatalogBrowser({
  title,
  subtitle,
  fixedFavorites,
  emptyTitle,
  emptyText,
  emptyAction,
}: {
  title: ReactNode;
  subtitle: string;
  fixedFavorites?: boolean;
  emptyTitle: string;
  emptyText: string;
  emptyAction?: ReactNode;
}) {
  const { perfumes } = useCatalog();
  const notesMap = useNotesMap();
  const noteName = useNoteName();
  const { query, patch, toggleNote, removeNote, clearNotes, resetAdvanced } = useFilters();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const effectiveQuery = useMemo(
    () => ({
      ...query,
      // игнорируем ноты, которых больше нет в базе (например, после импорта)
      noteIds: query.noteIds.filter((id) => notesMap.has(id)),
      favoritesOnly: fixedFavorites ? true : query.favoritesOnly,
    }),
    [query, fixedFavorites, notesMap]
  );

  const results = useMemo(
    () => applyQuery(perfumes, effectiveQuery, noteName),
    [perfumes, effectiveQuery, noteName]
  );

  const selectedNotes = query.noteIds
    .map((id) => notesMap.get(id))
    .filter((n): n is NonNullable<typeof n> => Boolean(n));

  const advancedCount = countAdvancedFilters(effectiveQuery) - (fixedFavorites ? 1 : 0);

  return (
    <div>
      {/* Заголовок */}
      <header className="pb-5 pt-[max(env(safe-area-inset-top),2.5rem)]">
        <h1 className="font-display text-[34px] leading-[1.1] tracking-tight text-cream">
          {title}
        </h1>
        <p className="mt-2 text-[13px] text-muted">{subtitle}</p>
      </header>

      {/* Поиск */}
      <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-line bg-card px-4">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          value={query.search}
          onChange={(e) => patch({ search: e.target.value })}
          placeholder="Название, бренд или нота…"
          className="h-full w-full bg-transparent text-[16px] text-cream outline-none placeholder:text-muted/60"
        />
        {query.search && (
          <button
            onClick={() => patch({ search: "" })}
            aria-label="Очистить поиск"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-faint text-muted transition active:bg-faint-strong"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Выбор нот */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex h-9 items-center gap-1.5 rounded-full border border-dashed border-gold/45 px-3.5 text-[13px] font-semibold text-gold transition active:scale-95"
        >
          <Plus size={15} />
          Выбрать ноту
        </button>
        {selectedNotes.map((n) => (
          <Chip key={n.id} label={n.name} image={n.image} variant={n.preference} onRemove={() => removeNote(n.id)} />
        ))}
        {selectedNotes.length > 1 && (
          <button
            onClick={clearNotes}
            className="text-[12px] font-medium text-muted underline-offset-2 active:underline"
          >
            Очистить
          </button>
        )}
      </div>

      {/* Режим совпадения */}
      {selectedNotes.length > 1 && (
        <div className="mt-3">
          <Segmented
            value={query.matchMode}
            onChange={(m) => patch({ matchMode: m })}
            options={[
              { value: "all", label: "Все выбранные ноты" },
              { value: "any", label: "Любая из нот" },
            ]}
          />
        </div>
      )}

      {/* Панель фильтров */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex h-10 items-center gap-2 rounded-full border border-line bg-card px-4 text-[13px] font-medium text-cream transition active:scale-95"
        >
          <SlidersHorizontal size={15} />
          Фильтры
          {advancedCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-ongold">
              {advancedCount}
            </span>
          )}
        </button>

        <div className="relative">
          <select
            value={query.sort}
            onChange={(e) => patch({ sort: e.target.value as SortMode })}
            aria-label="Сортировка"
            className="h-10 appearance-none rounded-full border border-line bg-card pl-4 pr-9 text-[13px] font-medium text-cream outline-none"
          >
            <option value="updated">Недавние</option>
            <option value="name">По названию</option>
            <option value="rating">По рейтингу</option>
            <option value="year">По году</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>

      <p className="mt-4 text-[12px] uppercase tracking-[0.12em] text-muted">
        {results.length > 0
          ? `Найдено: ${results.length} ${plural(results.length, "аромат", "аромата", "ароматов")}`
          : "\u00A0"}
      </p>

      {/* Сетка */}
      {results.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-x-3.5 gap-y-6">
          {results.map((p, i) => (
            <PerfumeCard key={p.id} perfume={p} notesMap={notesMap} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Sparkles size={26} strokeWidth={1.5} />}
          title={emptyTitle}
          text={emptyText}
          action={
            emptyAction ?? (
              <GhostButton
                onClick={() => {
                  resetAdvanced();
                  clearNotes();
                  patch({ search: "" });
                }}
              >
                Сбросить фильтры
              </GhostButton>
            )
          }
        />
      )}

      <NotePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={query.noteIds}
        onToggle={toggleNote}
      />
      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={results.length}
        fixedFavorites={fixedFavorites}
      />
    </div>
  );
}
