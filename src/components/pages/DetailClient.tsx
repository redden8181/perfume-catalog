"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Heart, Pencil, SearchX, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCatalog } from "@/core/catalog-store";
import { TIER_LABELS, TIER_ORDER, GENDER_LABELS } from "@/core/types";
import { cn, formatDate } from "@/core/utils";
import { ImageOrPlaceholder } from "@/components/ImageOrPlaceholder";
import { NotePill } from "@/components/NotesChips";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/Sheet";
import { EmptyState, GhostButton, Overline, RatingStars } from "@/components/ui";

export function DetailClient() {
  const catalog = useCatalog();
  const { getPerfume, getBrand, getNote, toggleFavorite, patchPerfume, removePerfume } = catalog;
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const perfume = getPerfume(id);

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!perfume) {
    return (
      <EmptyState
        icon={SearchX}
        title="Аромат не найден"
        text="Возможно, он был удалён или ссылка устарела."
      >
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-full bg-gradient-to-b from-gold-2 to-gold px-6 text-[15px] font-bold text-[#1c1610]"
        >
          В каталог
        </Link>
      </EmptyState>
    );
  }

  const brand = getBrand(perfume.brandId);

  return (
    <div className="animate-fade-up">
      <PageHeader back title="" subtitle="">
        <Link
          href={`/edit?id=${encodeURIComponent(perfume.id)}`}
          prefetch={false}
          aria-label="Редактировать"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ivory transition-colors active:bg-surface-2"
        >
          <Pencil className="h-5 w-5" />
        </Link>
      </PageHeader>

      <div className="grid gap-7 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10">
        {/* Фото */}
        <div className="relative">
          <ImageOrPlaceholder
            src={perfume.image}
            seed={`${brand?.name ?? ""} ${perfume.name}`}
            label={perfume.name}
            eager
            className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[28px] border border-line shadow-card"
            imgClassName="aspect-[4/5] w-full rounded-[28px] border border-line object-cover shadow-card"
          />
        </div>

        {/* Информация */}
        <div className="space-y-6">
          <div>
            <Overline>{brand?.name ?? "Без бренда"}</Overline>
            <h1 className="mt-1.5 font-display text-4xl font-semibold leading-[1.05] text-ivory sm:text-5xl">
              {perfume.name}
            </h1>
            <p className="mt-2.5 text-[15px] text-muted">
              {GENDER_LABELS[perfume.gender]}
              {perfume.year ? ` · ${perfume.year} года` : " · год не указан"}
            </p>

            <div className="mt-4 flex items-center gap-4">
              <RatingStars
                value={perfume.rating}
                onChange={(v) => patchPerfume(perfume.id, { rating: v })}
                size={24}
              />
              <span className="text-sm text-faint">
                {perfume.rating > 0 ? `${perfume.rating}/5` : "нет оценки"}
              </span>
            </div>

            <button
              onClick={() => toggleFavorite(perfume.id)}
              className={cn(
                "mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border px-6 text-[15px] font-bold transition-all active:scale-[0.98] sm:w-auto",
                perfume.favorite
                  ? "border-wine/60 bg-wine/15 text-wine"
                  : "border-line-2 bg-surface text-ivory active:bg-surface-2",
              )}
            >
              <Heart className={cn("h-5 w-5", perfume.favorite && "fill-wine")} />
              {perfume.favorite ? "В избранном" : "В избранное"}
            </button>
          </div>

          {/* Пирамида нот */}
          <section className="space-y-4 rounded-3xl border border-line bg-surface/60 p-5">
            {TIER_ORDER.map((tier) => {
              const ids = perfume.notes[tier];
              if (ids.length === 0) return null;
              return (
                <div key={tier}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/85">
                    {TIER_LABELS[tier]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ids.map((noteId) => {
                      const note = getNote(noteId);
                      return note ? (
                        <NotePill key={noteId} noteId={noteId} name={note.name} />
                      ) : null;
                    })}
                  </div>
                </div>
              );
              })}
            <p className="text-xs leading-relaxed text-faint">
              Нажмите на ноту, чтобы увидеть все ароматы с ней в каталоге.
            </p>
          </section>

          {perfume.description && (
            <section>
              <Overline className="mb-2">Описание</Overline>
              <p className="text-[15px] leading-relaxed text-ivory/90">{perfume.description}</p>
            </section>
          )}

          {perfume.characteristics && (
            <section className="rounded-2xl border border-line bg-surface/50 p-4">
              <Overline className="mb-2">Характеристики</Overline>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                {perfume.characteristics}
              </p>
            </section>
          )}

          {/* Личные заметки */}
          <PersonalNotesEditor
            key={perfume.id}
            value={perfume.personalNotes}
            onSave={(text) => patchPerfume(perfume.id, { personalNotes: text })}
          />

          <p className="text-xs text-faint">
            Добавлен {formatDate(perfume.createdAt)}
            {perfume.updatedAt !== perfume.createdAt && ` · обновлён ${formatDate(perfume.updatedAt)}`}
          </p>

          <div className="border-t border-line pt-5">
            <GhostButton
              onClick={() => setConfirmDelete(true)}
              className="border-wine/40 text-wine active:bg-wine/10"
            >
              <Trash2 className="h-5 w-5" />
              Удалить аромат
            </GhostButton>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить аромат?"
        text={`«${perfume.name}» будет удалён из каталога безвозвратно. Ноты и бренд останутся.`}
        confirmLabel="Удалить"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          removePerfume(perfume.id);
          router.replace("/");
        }}
      />
    </div>
  );
}

/** Редактор личных заметок с автосохранением при потере фокуса. */
function PersonalNotesEditor({
  value,
  onSave,
}: {
  value: string;
  onSave: (text: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const dirty = draft.trim() !== value.trim();
  const save = () => onSave(draft.trim());

  return (
    <section className="rounded-2xl border border-gold/25 bg-gold/5 p-4">
      <Overline className="mb-2">Мои заметки</Overline>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (dirty) save();
        }}
        placeholder="Очень понравился. Купить позже. Напоминает…"
        className="min-h-24 w-full resize-y rounded-xl border border-line bg-ink/50 px-3.5 py-3 text-[15px] leading-relaxed text-ivory placeholder:text-faint focus:border-gold/50 focus:outline-none"
      />
      {dirty && (
        <button
          onClick={save}
          className="mt-2 inline-flex min-h-10 animate-fade-in items-center gap-1.5 rounded-full bg-gold px-4 text-sm font-bold text-ink active:scale-[0.98]"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
          Сохранить заметку
        </button>
      )}
    </section>
  );
}
