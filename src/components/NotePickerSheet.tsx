import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { useCatalog, useNoteUsage } from "../hooks/useCatalog";
import { catalog } from "../core/catalogStore";
import { noteKey, plural } from "../core/utils";
import { cn } from "../utils/cn";
import { GoldButton, Sheet } from "./ui";

/**
 * Шторка выбора нот: поиск, мультивыбор, создание новой ноты на лету.
 */
export function NotePickerSheet({
  open,
  onClose,
  selected,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const { notes } = useCatalog();
  const usage = useNoteUsage();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = noteKey(search);
    const list = q ? notes.filter((n) => noteKey(n.name).includes(q)) : notes;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [notes, search]);

  const exactExists = search.trim().length > 0 && catalog.findNoteByName(search);
  const showCreate = search.trim().length > 0 && !exactExists;

  const handleCreate = () => {
    const note = catalog.addNote(search);
    if (note) onToggle(note.id);
    setSearch("");
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Выбрать ноты"
      footer={<GoldButton onClick={onClose}>Готово</GoldButton>}
    >
      <div className="sticky top-0 z-10 -mx-1 bg-coal px-1 pb-3 pt-1">
        <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-line bg-card px-4">
          <Search size={17} className="shrink-0 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти или создать ноту…"
            className="h-full w-full bg-transparent text-[16px] text-cream outline-none placeholder:text-muted/60"
          />
        </div>
      </div>

      {showCreate && (
        <button
          onClick={handleCreate}
          className="mb-2 flex min-h-[48px] w-full items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-2 text-left text-[14px] font-medium text-goldsoft transition active:scale-[0.99]"
        >
          <Plus size={17} />
          Создать «{search.trim()}»
        </button>
      )}

      <div className="flex flex-col">
        {filtered.map((n) => {
          const active = selected.includes(n.id);
          const count = usage.get(n.id) ?? 0;
          let nameColor = active ? "text-goldsoft font-semibold" : "text-cream";
          if (n.preference === "like") nameColor = "text-like-text font-semibold";
          if (n.preference === "dislike") nameColor = "text-dislike-text font-semibold";

          return (
            <button
              key={n.id}
              onClick={() => onToggle(n.id)}
              className={cn(
                "flex min-h-[60px] items-center justify-between gap-3 border-b border-faint py-2 text-left transition active:bg-faint"
              )}
            >
              <span className="flex flex-1 items-center gap-3">
                {n.image && (
                  <img src={n.image} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover border border-line shadow-sm" />
                )}
                <span className="flex-1 overflow-hidden">
                  <span className={cn("block text-[15px]", nameColor)}>
                    {n.name}
                  </span>
                  <span className="block text-[11px] text-muted">
                    {count > 0 ? `${count} ${plural(count, "аромат", "аромата", "ароматов")}` : "не используется"}
                  </span>
                </span>
              </span>
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full border transition",
                  active ? "border-gold bg-gold text-ongold" : "border-line-strong text-transparent"
                )}
              >
                <Check size={14} strokeWidth={3} />
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && !showCreate && (
          <p className="py-8 text-center text-[13px] text-muted">Ноты не найдены</p>
        )}
      </div>
    </Sheet>
  );
}
