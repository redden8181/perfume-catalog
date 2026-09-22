import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, ImagePlus, RefreshCw, Trash2, X } from "lucide-react";
import { catalog } from "../core/catalogStore";
import { useCatalog } from "../hooks/useCatalog";
import {
  createEmptyDraft,
  GENDER_LABELS,
  type Gender,
  type PerfumeDraft,
} from "../core/types";
import { fileToDataUrl } from "../utils/image";
import { NoteInput } from "../components/NoteInput";
import {
  ConfirmSheet,
  DangerButton,
  FieldLabel,
  GoldButton,
  Segmented,
  StarRating,
  Switch,
  toast,
} from "../components/ui";

const inputClass =
  "h-[52px] w-full rounded-2xl border border-line bg-card px-4 text-[16px] text-cream outline-none placeholder:text-muted/60 focus:border-gold/40";

const areaClass =
  "w-full resize-none rounded-2xl border border-line bg-card p-4 text-[16px] leading-relaxed text-cream outline-none placeholder:text-muted/60 focus:border-gold/40";

export function PerfumeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { perfumes } = useCatalog();
  const existing = id ? perfumes.find((p) => p.id === id) : undefined;

  const [draft, setDraft] = useState<PerfumeDraft>(() =>
    existing
      ? {
          brand: existing.brand,
          name: existing.name,
          gender: existing.gender,
          year: existing.year,
          image: existing.image,
          notes: { ...existing.notes },
          description: existing.description,
          characteristics: existing.characteristics,
          personalNotes: existing.personalNotes,
          rating: existing.rating,
          favorite: existing.favorite,
        }
      : createEmptyDraft()
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<PerfumeDraft>) => setDraft((d) => ({ ...d, ...p }));
  const valid = draft.brand.trim().length > 0 && draft.name.trim().length > 0;

  if (id && !existing) {
    navigate("/", { replace: true });
    return null;
  }

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      patch({ image: dataUrl });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не удалось загрузить фото");
    }
  };

  const handleSave = () => {
    if (!valid) {
      toast("Укажите бренд и название");
      return;
    }
    if (existing) {
      catalog.updatePerfume(existing.id, draft);
      toast("Изменения сохранены");
      navigate(`/perfume/${existing.id}`, { replace: true });
    } else {
      const created = catalog.addPerfume(draft);
      toast("Аромат добавлен");
      navigate(`/perfume/${created.id}`, { replace: true });
    }
  };

  const parseYear = (v: string): number | null => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Верхняя панель */}
      <div className="flex items-center gap-3 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <button
          onClick={() => navigate(-1)}
          aria-label="Назад"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-card text-cream transition active:scale-95"
        >
          <ChevronLeft size={19} />
        </button>
        <h1 className="font-display text-[22px] text-cream">
          {existing ? "Редактировать" : "Новый аромат"}
        </h1>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {/* Фото */}
        <section>
          <FieldLabel>Фото флакона</FieldLabel>
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
          {draft.image ? (
            <div className="relative overflow-hidden rounded-3xl border border-line">
              <img src={draft.image} alt="Флакон" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  aria-label="Заменить фото"
                  className="grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition active:scale-95"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => patch({ image: null })}
                  aria-label="Удалить фото"
                  className="grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur-md transition active:scale-95"
                >
                  <X size={17} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-gold/30 bg-gold/[0.04] text-goldsoft transition active:scale-[0.99]"
            >
              <ImagePlus size={28} strokeWidth={1.5} />
              <span className="text-[13px] font-medium">Добавить фото</span>
              <span className="text-[11px] text-muted">Из галереи или камеры</span>
            </button>
          )}
        </section>

        {/* Основное */}
        <section className="flex flex-col gap-4">
          <div>
            <FieldLabel>Бренд *</FieldLabel>
            <input
              value={draft.brand}
              onChange={(e) => patch({ brand: e.target.value })}
              placeholder="Maison Margiela"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Название *</FieldLabel>
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Replica By the Fireplace"
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel>Пол</FieldLabel>
            <Segmented
              value={draft.gender}
              onChange={(g) => patch({ gender: g as Gender })}
              options={(Object.keys(GENDER_LABELS) as Gender[]).map((g) => ({
                value: g,
                label: GENDER_LABELS[g],
              }))}
            />
          </div>
          <div>
            <FieldLabel>Год выпуска</FieldLabel>
            <input
              type="number"
              inputMode="numeric"
              value={draft.year ?? ""}
              onChange={(e) => patch({ year: parseYear(e.target.value) })}
              placeholder="2020"
              className={inputClass}
            />
          </div>
        </section>

        {/* Ноты */}
        <section className="flex flex-col gap-4">
          <NoteInput
            label="Верхние ноты"
            value={draft.notes.top}
            onChange={(ids) => patch({ notes: { ...draft.notes, top: ids } })}
          />
          <NoteInput
            label="Средние ноты"
            value={draft.notes.heart}
            onChange={(ids) => patch({ notes: { ...draft.notes, heart: ids } })}
          />
          <NoteInput
            label="Базовые ноты"
            value={draft.notes.base}
            onChange={(ids) => patch({ notes: { ...draft.notes, base: ids } })}
          />
        </section>

        {/* Тексты */}
        <section className="flex flex-col gap-4">
          <div>
            <FieldLabel>Описание</FieldLabel>
            <textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Чем пахнет, как раскрывается, настроение…"
              rows={3}
              className={areaClass}
            />
          </div>
          <div>
            <FieldLabel>Дополнительные характеристики</FieldLabel>
            <textarea
              value={draft.characteristics}
              onChange={(e) => patch({ characteristics: e.target.value })}
              placeholder="Стойкость, шлейф, сезон, время суток…"
              rows={2}
              className={areaClass}
            />
          </div>
          <div>
            <FieldLabel>Мои личные заметки</FieldLabel>
            <textarea
              value={draft.personalNotes}
              onChange={(e) => patch({ personalNotes: e.target.value })}
              placeholder="Купить позже, напоминает…"
              rows={2}
              className={areaClass}
            />
          </div>
        </section>

        {/* Рейтинг и избранное */}
        <section className="flex items-center justify-between rounded-3xl border border-line bg-card p-4">
          <div>
            <FieldLabel>Рейтинг</FieldLabel>
            <StarRating value={draft.rating} onChange={(v) => patch({ rating: v })} size={20} />
          </div>
          <Switch
            checked={draft.favorite}
            onChange={(v) => patch({ favorite: v })}
            label=""
            icon={<Heart size={18} className={draft.favorite ? "fill-gold text-gold" : "text-muted"} />}
          />
        </section>

        {/* Сохранить */}
        <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+92px)] z-20 pt-2">
          <GoldButton onClick={handleSave} disabled={!valid} className="shadow-2xl shadow-black/40">
            {existing ? "Сохранить изменения" : "Добавить в каталог"}
          </GoldButton>
        </div>

        {existing && (
          <DangerButton onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} />
            Удалить аромат
          </DangerButton>
        )}
      </div>

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (existing) catalog.removePerfume(existing.id);
          toast("Аромат удалён");
          navigate("/", { replace: true });
        }}
        title="Удалить аромат?"
        text="Действие нельзя отменить. Ноты останутся в базе."
      />
    </motion.div>
  );
}
