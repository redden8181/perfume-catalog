import { useMemo, useRef, useState } from "react";
import { Leaf, Search, ImagePlus, RefreshCw, X, Trash2 } from "lucide-react";
import { catalog } from "../core/catalogStore";
import { useCatalog, useNoteUsage } from "../hooks/useCatalog";
import { noteKey, plural } from "../core/utils";
import type { Note, NotePreference } from "../core/types";
import { fileToDataUrl } from "../utils/image";
import { cn } from "../utils/cn";
import {
  EmptyState,
  FieldLabel,
  GhostButton,
  GoldButton,
  Segmented,
  Sheet,
  toast,
} from "../components/ui";

/** Шторка редактирования отдельной ноты */
function NoteEditSheet({
  note,
  onClose,
}: {
  note: Note | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Partial<Note>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Сброс драфта при открытии
  useMemo(() => {
    if (note) {
      setDraft({ name: note.name, image: note.image, preference: note.preference });
    }
  }, [note]);

  if (!note) return null;

  const currentImage = draft.image !== undefined ? draft.image : note.image;
  const currentPref = (draft.preference ?? note.preference) as NotePreference;
  const currentName = draft.name ?? note.name;

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      // Для нот сжимаем сильнее (макс 256px), чтобы не раздувать JSON
      const dataUrl = await fileToDataUrl(file, 256, 0.8);
      setDraft((d) => ({ ...d, image: dataUrl }));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не удалось загрузить фото");
    }
  };

  const handleSave = () => {
    if (!currentName.trim()) {
      toast("Введите название ноты");
      return;
    }
    catalog.updateNote(note.id, {
      name: currentName,
      image: currentImage,
      preference: currentPref,
    });
    toast("Нота сохранена");
    onClose();
  };

  return (
    <Sheet
      open={!!note}
      onClose={onClose}
      title="Редактировать ноту"
      footer={<GoldButton onClick={handleSave}>Сохранить</GoldButton>}
    >
      <div className="flex flex-col gap-6 pt-2">
        <section className="flex flex-col items-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void handlePhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="relative h-24 w-24">
            {currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt={currentName}
                  className="h-full w-full rounded-full object-cover border-2 border-line shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <button
                    onClick={() => setDraft((d) => ({ ...d, image: null }))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-danger/90 text-white shadow"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="grid h-8 w-8 place-items-center rounded-full bg-gold text-ongold shadow"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="grid h-full w-full place-items-center rounded-full border-2 border-dashed border-gold/40 bg-gold/[0.04] text-goldsoft transition active:scale-95"
              >
                <ImagePlus size={24} />
              </button>
            )}
          </div>
          <p className="mt-3 text-[11px] text-muted">Миниатюра ноты</p>
        </section>

        <section>
          <FieldLabel>Название</FieldLabel>
          <input
            value={currentName}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            className="h-[52px] w-full rounded-2xl border border-line bg-card px-4 text-[16px] text-cream outline-none focus:border-gold/40"
          />
        </section>

        <section>
          <FieldLabel>Отношение</FieldLabel>
          <Segmented
            value={currentPref}
            onChange={(p) => setDraft((d) => ({ ...d, preference: p as NotePreference }))}
            options={[
              { value: "like", label: "Нравится" },
              { value: "neutral", label: "Нейтрально" },
              { value: "dislike", label: "Не нравится" },
            ]}
          />
        </section>
      </div>
    </Sheet>
  );
}

export function NotesPage() {
  const { notes } = useCatalog();
  const usage = useNoteUsage();
  const [search, setSearch] = useState("");
  const [filterPref, setFilterPref] = useState<NotePreference | "all">("all");
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const filtered = useMemo(() => {
    const q = noteKey(search);
    let list = notes;
    if (filterPref !== "all") {
      list = list.filter((n) => n.preference === filterPref);
    }
    if (q) {
      list = list.filter((n) => noteKey(n.name).includes(q));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [notes, search, filterPref]);

  return (
    <div>
      <header className="pb-5 pt-[max(env(safe-area-inset-top),2.5rem)]">
        <h1 className="font-display text-[34px] leading-[1.1] tracking-tight text-cream">
          Ноты
        </h1>
        <p className="mt-2 text-[13px] text-muted">
          Управляйте нотами: добавляйте фото и отмечайте любимые
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-line bg-card px-4">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Найти ноту…"
            className="h-full w-full bg-transparent text-[16px] text-cream outline-none placeholder:text-muted/60"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-faint text-muted transition active:bg-faint-strong"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <Segmented
          value={filterPref}
          onChange={(v) => setFilterPref(v as typeof filterPref)}
          options={[
            { value: "all", label: "Все" },
            { value: "like", label: "Нравятся" },
            { value: "dislike", label: "Не нравятся" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {filtered.map((n) => {
          const count = usage.get(n.id) ?? 0;
          let colorClass = "bg-card border-line";
          let nameColor = "text-cream";
          if (n.preference === "like") {
            colorClass = "bg-like-bg/20 border-like-border/40";
            nameColor = "text-like-text font-medium";
          } else if (n.preference === "dislike") {
            colorClass = "bg-dislike-bg/20 border-dislike-border/40";
            nameColor = "text-dislike-text font-medium";
          }

          return (
            <button
              key={n.id}
              onClick={() => setEditingNote(n)}
              className={cn(
                "flex items-center gap-4 rounded-2xl border p-3 text-left transition active:scale-[0.98]",
                colorClass
              )}
            >
              {n.image ? (
                <img src={n.image} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover border border-line" />
              ) : (
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-faint-strong text-muted">
                  <Leaf size={20} strokeWidth={1.5} />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className={cn("truncate text-[16px]", nameColor)}>{n.name}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {count > 0 ? `${count} ${plural(count, "аромат", "аромата", "ароматов")}` : "Не используется"}
                </p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <EmptyState
            icon={<Leaf size={26} strokeWidth={1.5} />}
            title="Ничего не найдено"
            text="Попробуйте изменить поисковый запрос или фильтр."
            action={
              <GhostButton onClick={() => { setSearch(""); setFilterPref("all"); }}>
                Сбросить
              </GhostButton>
            }
          />
        )}
      </div>

      <NoteEditSheet note={editingNote} onClose={() => setEditingNote(null)} />
    </div>
  );
}
