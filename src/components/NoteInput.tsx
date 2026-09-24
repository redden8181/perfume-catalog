import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { useCatalog } from "../hooks/useCatalog";
import { catalog } from "../core/catalogStore";
import { noteKey } from "../core/utils";
import { Chip, FieldLabel } from "./ui";

/**
 * Поле ввода нот с автодополнением по существующим нотам каталога.
 * Начинаете вводить «мал…» — предложит «Малина»; если ноты нет — можно создать.
 * Дубликат («малина» vs «Малина») невозможен благодаря catalog.addNote.
 */
export function NoteInput({
  label,
  value,
  onChange,
  placeholder = "Начните вводить ноту…",
}: {
  label: string;
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}) {
  const { notes } = useCatalog();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<number | undefined>(undefined);

  const suggestions = useMemo(() => {
    const q = noteKey(text);
    return notes
      .filter((n) => !value.includes(n.id))
      .filter((n) => (q ? noteKey(n.name).includes(q) : true))
      .slice(0, 5);
  }, [notes, text, value]);

  const exact = text.trim().length > 0 && catalog.findNoteByName(text);
  const canCreate = text.trim().length > 0 && !exact;
  const showDropdown = focused && (suggestions.length > 0 || canCreate);

  const add = (id: string) => {
    if (!value.includes(id)) onChange([...value, id]);
    setText("");
  };

  const create = () => {
    const note = catalog.addNote(text);
    if (note) add(note.id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (suggestions.length > 0) add(suggestions[0].id);
    else if (canCreate) create();
  };

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="rounded-2xl border border-line bg-card p-3">
        {value.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-2">
            {value.map((id) => {
              const note = notes.find((n) => n.id === id);
              if (!note) return null;
              return (
                <Chip
                  key={id}
                  label={note.name}
                  image={note.image}
                  variant={note.preference}
                  onRemove={() => onChange(value.filter((x) => x !== id))}
                />
              );
            })}
          </div>
        )}
        <div className="relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              window.clearTimeout(blurTimer.current);
              setFocused(true);
            }}
            onBlur={() => {
              blurTimer.current = window.setTimeout(() => setFocused(false), 150);
            }}
            placeholder={placeholder}
            className="h-11 w-full rounded-xl bg-faint px-3.5 text-[16px] text-cream outline-none placeholder:text-muted/60 focus:bg-faint-strong"
          />
          {showDropdown && (
            <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-lift shadow-2xl shadow-black/25">
              {suggestions.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(n.id);
                  }}
                  className="flex min-h-[46px] w-full items-center px-4 text-left text-[14px] text-cream transition active:bg-faint"
                >
                  {n.name}
                </button>
              ))}
              {canCreate && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    create();
                  }}
                  className="flex min-h-[46px] w-full items-center gap-2 border-t border-line px-4 text-left text-[14px] font-medium text-goldsoft transition active:bg-faint"
                >
                  <Plus size={15} />
                  Создать «{text.trim()}»
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
