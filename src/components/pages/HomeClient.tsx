"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, SearchX, SlidersHorizontal, SprayCan } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCatalog } from "@/core/catalog-store";
import {
  applyFilters,
  buildFilterContext,
  countActiveFilters,
  EMPTY_FILTERS,
  sortPerfumes,
  type PerfumeFilters,
} from "@/core/filter";
import type { NoteFilterMode, SortKey } from "@/core/types";
import { SORT_LABELS } from "@/core/types";
import { cn } from "@/core/utils";
import { FilterSheet } from "@/components/FilterSheet";
import { NotePickerSheet } from "@/components/NotePickerSheet";
import { SelectedNoteChip } from "@/components/NotesChips";
import { PerfumeCard } from "@/components/PerfumeCard";
import { EmptyState, GhostButton, Overline, SearchInput, Segmented } from "@/components/ui";

export function HomeClient() {
  const catalog = useCatalog();
  const { perfumes, notes, brands, getNote, data, setNoteFilterMode } = catalog;
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<PerfumeFilters>({
    ...EMPTY_FILTERS,
    noteMode: data.settings.noteFilterMode,
  });
  const [sort, setSort] = useState<SortKey>("updated");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Однократная инициализация выбранных нот из URL (?notes=id1,id2)
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const fromUrl = searchParams.get("notes");
    if (fromUrl) {
      const ids = fromUrl.split(",").filter((id) => notes.some((n) => n.id === id));
      if (ids.length > 0) {
        setFilters((f) => ({ ...f, noteIds: ids }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ctx = useMemo(() => buildFilterContext(notes, brands), [notes, brands]);

  const results = useMemo(
    () => sortPerfumes(applyFilters(perfumes, filters, ctx), sort),
    [perfumes, filters, ctx, sort],
  );

  const selectedNotes = filters.noteIds
    .map((id) => getNote(id))
    .filter((n): n is NonNullable<typeof n> => Boolean(n));

  const toggleNote = (id: string) => {
    setFilters((f) => ({
      ...f,
      noteIds: f.noteIds.includes(id)
        ? f.noteIds.filter((x) => x !== id)
        : [...f.noteIds, id],
    }));
  };

  const setMode = (mode: NoteFilterMode) => {
    setFilters((f) => ({ ...f, noteMode: mode }));
    setNoteFilterMode(mode);
  };

  const resetAll = () => setFilters({ ...EMPTY_FILTERS, noteMode: filters.noteMode });

  const activeExtra = countActiveFilters(filters);
  const hasAnyFilter =
    activeExtra > 0 || filters.query.trim() !== "" || filters.noteIds.length > 0;

  if (perfumes.length === 0) {
    return (
      <div className="pt-10">
        <Hero />
        <EmptyState
          icon={SprayCan}
          title="Каталог пуст"
          text="Добавьте первый аромат — или загрузите демонстрационные данные в настройках."
        >
          <Link
            href="/add"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-b from-gold-2 to-gold px-6 text-[15px] font-bold text-[#1c1610]"
          >
            <Plus className="h-5 w-5" /> Добавить парфюм
          </Link>
          <GhostButton onClick={() => catalog.seedDemoData()}>Демо-данные</GhostButton>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Hero />

      <SearchInput
        value={filters.query}
        onChange={(q) => setFilters((f) => ({ ...f, query: q }))}
        placeholder="Поиск по названию, бренду или ноте"
      />

      {/* Выбор нот */}
      <section aria-label="Фильтр по нотам" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPickerOpen(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-dashed border-gold/50 px-4 text-sm font-semibold text-gold-2 transition-colors active:bg-gold/10"
          >
            <Plus className="h-4 w-4" />
            Выбрать ноту
          </button>
          {selectedNotes.map((note) => (
            <SelectedNoteChip key={note.id} name={note.name} onRemove={() => toggleNote(note.id)} />
          ))}
        </div>

        {selectedNotes.length >= 2 && (
          <div className="animate-fade-up">
            <Segmented
              options={[
                { value: "all", label: "Содержит все ноты" },
                { value: "any", label: "Любую из нот" },
              ]}
              value={filters.noteMode}
              onChange={setMode}
              className="max-w-md"
            />
          </div>
        )}
      </section>

      {/* Панель результатов */}
      <div className="flex items-center gap-2 border-t border-line pt-4">
        <p className="flex-1 text-sm text-muted">
          Найдено:{" "}
          <span className="font-bold text-ivory">{results.length}</span>
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Сортировка"
          className="h-11 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-muted focus:border-gold/50 focus:outline-none"
        >
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
        <button
          onClick={() => setFilterOpen(true)}
          aria-label="Фильтры"
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
            activeExtra > 0
              ? "border-gold/60 bg-gold/15 text-gold-2"
              : "border-line text-muted active:bg-surface-2",
          )}
        >
          <SlidersHorizontal className="h-5 w-5" />
          {activeExtra > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink">
              {activeExtra}
            </span>
          )}
        </button>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Ничего не найдено"
          text="Попробуйте убрать часть нот, изменить режим на «Любую из нот» или сбросить фильтры."
        >
          {hasAnyFilter && <GhostButton onClick={resetAll}>Сбросить всё</GhostButton>}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p, i) => (
            <PerfumeCard key={p.id} perfume={p} index={i} />
          ))}
        </div>
      )}

      <NotePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedIds={filters.noteIds}
        onToggle={toggleNote}
      />
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onApply={setFilters}
        resultCount={results.length}
      />
    </div>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden pb-2 pt-6">
      <Overline>Личная коллекция</Overline>
      <h1 className="mt-2 font-display text-[42px] font-semibold leading-[1.05] text-ivory sm:text-6xl">
        Найди свой <em className="text-gold-gradient">аромат</em>
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        Выберите одну или несколько нот — каталог покажет только те ароматы,
        в которых они звучат вместе.
      </p>
    </div>
  );
}
