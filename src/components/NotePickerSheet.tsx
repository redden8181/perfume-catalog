"use client";

import { Check, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useCatalog } from "@/core/catalog-store";
import { allNoteIds } from "@/core/filter";
import { cn, displayName, normalizeName } from "@/core/utils";
import { Sheet } from "./Sheet";

/**
 * Панель выбора нот: список существующих нот с количеством парфюмов,
 * поиск и создание новой ноты прямо из строки поиска.
 */
export function NotePickerSheet({
  open,
  onClose,
  selectedIds,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggle: (noteId: string) => void;
}) {
  const { notes, perfumes, ensureNote } = useCatalog();
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of perfumes) {
      for (const id of allNoteIds(p)) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [perfumes]);

  const visible = useMemo(() => {
    const q = normalizeName(query);
    const list = q
      ? notes.filter((n) => n.normalized.includes(q))
      : [...notes];
    return list.sort((a, b) => {
      const diff = (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0);
      return diff !== 0 ? diff : a.name.localeCompare(b.name, "ru-RU");
    });
  }, [notes, counts, query]);

  const canCreate =
    query.trim().length > 0 &&
    !notes.some((n) => n.normalized === normalizeName(query));

  const handleCreate = () => {
    const created = ensureNote(query);
    if (created) {
      onToggle(created.id);
      setQuery("");
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Выбор нот">
      <div className="relative pb-3">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Начните вводить: мал…"
          autoFocus
          className="h-12 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-base text-ivory placeholder:text-faint focus:border-gold/50 focus:outline-none"
        />
      </div>

      {canCreate && (
        <button
          onClick={handleCreate}
          className="mb-2 flex min-h-12 w-full items-center gap-3 rounded-2xl border border-dashed border-gold/50 bg-gold/10 px-4 text-left text-[15px] font-semibold text-gold-2 transition-colors active:bg-gold/20"
        >
          <Plus className="h-5 w-5 shrink-0" />
          Создать ноту «{displayName(query)}»
        </button>
      )}

      <ul className="divide-y divide-line">
        {visible.map((note) => {
          const selected = selectedIds.includes(note.id);
          const count = counts.get(note.id) ?? 0;
          return (
            <li key={note.id}>
              <button
                onClick={() => onToggle(note.id)}
                className={cn(
                  "flex min-h-13 w-full items-center gap-3 px-1 py-3 text-left transition-colors",
                  selected ? "text-gold-2" : "text-ivory active:text-gold-2",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected ? "border-gold bg-gold text-ink" : "border-line-2",
                  )}
                >
                  {selected && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className="flex-1 text-[15px] font-medium">{note.name}</span>
                <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
                  {count}
                </span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 && !canCreate && (
          <li className="py-8 text-center text-sm text-faint">
            Ноты пока не добавлены — они создаются при добавлении парфюмов.
          </li>
        )}
      </ul>
    </Sheet>
  );
}
