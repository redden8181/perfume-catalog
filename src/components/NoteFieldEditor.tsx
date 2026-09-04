"use client";

import { CornerDownLeft, Plus, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useCatalog } from "@/core/catalog-store";
import { displayName, normalizeName } from "@/core/utils";

/**
 * Поле редактирования нот с автодополнением:
 * «мал…» → подсказка «Малина»; если ноты нет — предлагает создать.
 * Нота — единая сущность, поэтому дальше работаем только с id.
 */
export function NoteFieldEditor({
  noteIds,
  onChange,
  placeholder,
}: {
  noteIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const { notes, getNote, ensureNote } = useCatalog();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = normalizeName(query);
    return notes
      .filter((n) => !noteIds.includes(n.id))
      .filter((n) => (q ? n.normalized.includes(q) : true))
      .sort((a, b) => {
        if (!q) return a.name.localeCompare(b.name, "ru-RU");
        const as = a.normalized.startsWith(q) ? 0 : 1;
        const bs = b.normalized.startsWith(q) ? 0 : 1;
        return as - bs || a.name.localeCompare(b.name, "ru-RU");
      })
      .slice(0, 7);
  }, [notes, noteIds, query]);

  const normalizedQuery = normalizeName(query);
  const exactExists = notes.some((n) => n.normalized === normalizedQuery);
  const canCreate = normalizedQuery.length > 0 && !exactExists;

  const addById = (id: string) => {
    if (noteIds.includes(id)) return;
    onChange([...noteIds, id]);
    setQuery("");
    inputRef.current?.focus();
  };

  const addByName = (name: string) => {
    const note = ensureNote(name);
    if (note) addById(note.id);
  };

  const handleEnter = () => {
    if (canCreate) {
      addByName(query);
    } else if (suggestions.length > 0) {
      addById(suggestions[0].id);
    }
  };

  const remove = (id: string) => onChange(noteIds.filter((x) => x !== id));

  return (
    <div className="space-y-2.5">
      {noteIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {noteIds.map((id) => {
            const note = getNote(id);
            if (!note) return null;
            return (
              <span
                key={id}
                className="inline-flex min-h-9 items-center gap-1 rounded-full border border-gold/40 bg-gold/10 pl-3.5 pr-1 text-sm font-semibold text-gold-2 animate-pop-in"
              >
                {note.name}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label={`Убрать ${note.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-gold/80 active:bg-gold/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 140)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleEnter();
            } else if (e.key === "Backspace" && query === "" && noteIds.length > 0) {
              remove(noteIds[noteIds.length - 1]);
            }
          }}
          placeholder={placeholder ?? "Добавить ноту…"}
          className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-ivory placeholder:text-faint focus:border-gold/50 focus:outline-none"
        />
        {query && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-faint">
            <CornerDownLeft className="h-4 w-4" />
          </span>
        )}

        {focused && (suggestions.length > 0 || canCreate) && (
          <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line-2 bg-ink-2 shadow-card animate-pop-in">
            <ul className="max-h-60 overflow-y-auto py-1">
              {canCreate && (
                <li>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addByName(query);
                    }}
                    className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-[15px] font-semibold text-gold-2 active:bg-gold/10"
                  >
                    <Plus className="h-5 w-5 shrink-0" />
                    Создать «{displayName(query)}»
                  </button>
                </li>
              )}
              {suggestions.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addById(note.id);
                    }}
                    className="flex min-h-11 w-full items-center px-4 text-left text-[15px] text-ivory active:bg-surface-2"
                  >
                    {note.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
