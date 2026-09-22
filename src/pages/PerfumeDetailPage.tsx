import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  FlaskConical,
  Heart,
  NotebookPen,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { catalog } from "../core/catalogStore";
import { useCatalog, useNotesMap } from "../hooks/useCatalog";
import { useFilters } from "../state/FilterContext";
import { GENDER_LABELS, LAYER_LABELS, LAYER_ORDER } from "../core/types";
import { Chip, ConfirmSheet, DangerButton, FieldLabel, GhostButton, StarRating } from "../components/ui";
import { cn } from "../utils/cn";

export function PerfumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { perfumes } = useCatalog();
  const notesMap = useNotesMap();
  const { setNotes, patch } = useFilters();

  const perfume = perfumes.find((p) => p.id === id);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteText, setNoteText] = useState(perfume?.personalNotes ?? "");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);

  // Синхронизация локальной заметки при смене парфюма
  useEffect(() => {
    setNoteText(perfume?.personalNotes ?? "");
    setSavedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  if (!perfume) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
        <Sparkles size={32} className="text-gold" />
        <h1 className="mt-4 font-display text-2xl text-cream">Аромат не найден</h1>
        <p className="mt-2 text-[13px] text-muted">Возможно, он был удалён.</p>
        <div className="mt-6 w-48">
          <GhostButton onClick={() => navigate("/")}>В каталог</GhostButton>
        </div>
      </div>
    );
  }

  const handleNoteClick = (noteId: string) => {
    patch({ search: "" });
    setNotes([noteId]);
    navigate("/");
  };

  const handlePersonalNote = (v: string) => {
    setNoteText(v);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      catalog.updatePerfume(perfume.id, { personalNotes: v });
      setSavedAt(Date.now());
    }, 600);
  };

  const handleDelete = () => {
    catalog.removePerfume(perfume.id);
    navigate("/", { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Верхняя панель */}
      <div className="flex items-center justify-between pt-[max(env(safe-area-inset-top),1.25rem)]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Назад"
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-cream transition active:scale-95"
        >
          <ChevronLeft size={19} />
        </button>
        <div className="flex gap-2.5">
          <Link
            to={`/edit/${perfume.id}`}
            aria-label="Редактировать"
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-cream transition active:scale-95"
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Удалить"
            className="grid h-10 w-10 place-items-center rounded-full border border-danger/25 bg-danger/10 text-danger transition active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Фото */}
      <div className="relative mt-4">
        <div className="aspect-[4/5] overflow-hidden rounded-[28px] border border-line bg-card">
          {perfume.image ? (
            <img src={perfume.image} alt={perfume.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-lift to-card text-gold/40">
              <FlaskConical size={72} strokeWidth={0.8} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <button
          onClick={() => catalog.toggleFavorite(perfume.id)}
          aria-label="В избранное"
          className={cn(
            "absolute -bottom-5 right-5 grid h-12 w-12 place-items-center rounded-full border-4 border-ink shadow-xl shadow-black/25 transition active:scale-90",
            perfume.favorite ? "bg-gold text-ongold" : "bg-lift text-cream"
          )}
        >
          <Heart size={20} className={perfume.favorite ? "fill-ongold" : ""} />
        </button>
      </div>

      {/* Шапка */}
      <div className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          {perfume.brand}
        </p>
        <h1 className="mt-1 font-display text-[32px] leading-tight text-cream">
          {perfume.name}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-line bg-card px-3 py-1.5 text-[12px] text-cream/85">
            {GENDER_LABELS[perfume.gender]}
          </span>
          {perfume.year && (
            <span className="rounded-full border border-line bg-card px-3 py-1.5 text-[12px] text-cream/85">
              {perfume.year} год
            </span>
          )}
        </div>
        <div className="mt-2">
          <StarRating
            value={perfume.rating}
            onChange={(v) => catalog.setRating(perfume.id, v)}
            size={20}
          />
        </div>
      </div>

      {/* Ноты */}
      <div className="mt-7 flex flex-col gap-4">
        {LAYER_ORDER.map((layer) => {
          const ids = perfume.notes[layer];
          if (ids.length === 0) return null;
          return (
            <section key={layer}>
              <FieldLabel>{LAYER_LABELS[layer]}</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {ids.map((nid) => {
                  const note = notesMap.get(nid);
                  if (!note) return null;
                  return (
                    <Chip key={nid} label={note.name} onClick={() => handleNoteClick(nid)} />
                  );
                })}
              </div>
            </section>
          );
        })}
        <p className="-mt-1 text-[11px] text-muted/80">
          Нажмите на ноту, чтобы увидеть все ароматы с ней
        </p>
      </div>

      {/* Описание */}
      {perfume.description && (
        <section className="mt-7">
          <FieldLabel>Описание</FieldLabel>
          <p className="text-[14px] leading-relaxed text-cream/85">{perfume.description}</p>
        </section>
      )}

      {/* Характеристики */}
      {perfume.characteristics && (
        <section className="mt-6">
          <FieldLabel>Характеристики</FieldLabel>
          <p className="text-[14px] leading-relaxed text-cream/85">{perfume.characteristics}</p>
        </section>
      )}

      {/* Личные заметки */}
      <section className="mt-7 rounded-3xl border border-gold/15 bg-gold/[0.05] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-goldsoft">
            <NotebookPen size={16} />
            <span className="text-[13px] font-semibold">Мои заметки</span>
          </div>
          {savedAt && <span className="text-[11px] text-muted">Сохранено</span>}
        </div>
        <textarea
          value={noteText}
          onChange={(e) => handlePersonalNote(e.target.value)}
          placeholder="Например: «Купить позже», «Напоминает Dior Homme»…"
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl bg-ink/60 p-3.5 text-[15px] leading-relaxed text-cream outline-none placeholder:text-muted/60"
        />
      </section>

      {/* Удаление */}
      <div className="mt-8">
        <DangerButton onClick={() => setConfirmDelete(true)}>
          <Trash2 size={16} />
          Удалить из каталога
        </DangerButton>
      </div>

      <p className="mt-6 text-center text-[11px] text-muted/60">
        Обновлено {new Date(perfume.updatedAt).toLocaleDateString("ru-RU")}
      </p>

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Удалить аромат?"
        text={`«${perfume.brand} ${perfume.name}» будет удалён из каталога без возможности восстановления. Сами ноты останутся.`}
      />
    </motion.div>
  );
}
