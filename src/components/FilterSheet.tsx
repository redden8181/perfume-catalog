"use client";

import { useState } from "react";
import { useCatalog } from "@/core/catalog-store";
import { EMPTY_FILTERS, type PerfumeFilters } from "@/core/filter";
import type { Gender } from "@/core/types";
import { GENDER_LABELS } from "@/core/types";
import { cn } from "@/core/utils";
import { Sheet } from "./Sheet";
import { Field, GoldButton, RatingStars, Toggle } from "./ui";

const GENDER_ORDER: Gender[] = ["female", "male", "unisex"];

export function FilterSheet(props: {
  open: boolean;
  onClose: () => void;
  value: PerfumeFilters;
  onApply: (next: PerfumeFilters) => void;
  resultCount: number;
}) {
  // Sheet размонтирует содержимое при закрытии —
  // поэтому черновик живёт во внутреннем компоненте
  // и каждый раз инициализируется актуальными фильтрами.
  if (!props.open) return null;
  return <FilterSheetBody {...props} />;
}

function FilterSheetBody({
  onClose,
  value,
  onApply,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  value: PerfumeFilters;
  onApply: (next: PerfumeFilters) => void;
  resultCount: number;
}) {
  const { brands, perfumes } = useCatalog();
  const [draft, setDraft] = useState<PerfumeFilters>(value);

  const toggleGender = (g: Gender) => {
    setDraft((d) => ({
      ...d,
      genders: d.genders.includes(g) ? d.genders.filter((x) => x !== g) : [...d.genders, g],
    }));
  };

  const brandCounts = new Map<string, number>();
  for (const p of perfumes) brandCounts.set(p.brandId, (brandCounts.get(p.brandId) ?? 0) + 1);
  const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name, "ru-RU"));

  const setYear = (key: "yearFrom" | "yearTo", raw: string) => {
    const num = raw.trim() === "" ? null : Number.parseInt(raw, 10);
    setDraft((d) => ({ ...d, [key]: num !== null && Number.isFinite(num) ? num : null }));
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="Фильтры"
      footer={
        <div className="flex gap-2">
          <button
            onClick={() => {
              onApply({ ...EMPTY_FILTERS, query: value.query, noteIds: value.noteIds, noteMode: value.noteMode });
              onClose();
            }}
            className="min-h-12 flex-1 rounded-full border border-line-2 text-[15px] font-semibold text-muted transition-colors active:bg-surface-2"
          >
            Сбросить
          </button>
          <GoldButton
            className="flex-[2]"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Показать: {resultCount}
          </GoldButton>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <Field label="Бренд">
          <select
            value={draft.brandId ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, brandId: e.target.value || null }))}
            className="h-12 w-full appearance-none rounded-2xl border border-line bg-surface px-4 text-base text-ivory focus:border-gold/50 focus:outline-none"
          >
            <option value="">Все бренды</option>
            {sortedBrands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({brandCounts.get(b.id) ?? 0})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Пол">
          <div className="flex flex-wrap gap-2">
            {GENDER_ORDER.map((g) => {
              const active = draft.genders.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGender(g)}
                  className={cn(
                    "min-h-11 rounded-full border px-5 text-sm font-semibold transition-colors",
                    active
                      ? "border-gold/60 bg-gold/15 text-gold-2"
                      : "border-line-2 text-muted active:bg-surface-2",
                  )}
                >
                  {GENDER_LABELS[g]}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Год выпуска">
          <div className="flex items-center gap-3">
            <input
              inputMode="numeric"
              placeholder="от 1990"
              value={draft.yearFrom ?? ""}
              onChange={(e) => setYear("yearFrom", e.target.value)}
              className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-ivory placeholder:text-faint focus:border-gold/50 focus:outline-none"
            />
            <span className="text-faint">—</span>
            <input
              inputMode="numeric"
              placeholder="до 2026"
              value={draft.yearTo ?? ""}
              onChange={(e) => setYear("yearTo", e.target.value)}
              className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-ivory placeholder:text-faint focus:border-gold/50 focus:outline-none"
            />
          </div>
        </Field>

        <Field label="Минимальный рейтинг" hint="Нажмите на выбранную звезду ещё раз, чтобы сбросить">
          <RatingStars
            value={draft.minRating}
            onChange={(v) => setDraft((d) => ({ ...d, minRating: v }))}
            size={26}
          />
        </Field>

        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5">
          <span className="text-[15px] font-medium text-ivory">Только избранное</span>
          <Toggle
            checked={draft.favoritesOnly}
            onChange={(v) => setDraft((d) => ({ ...d, favoritesOnly: v }))}
            label="Только избранное"
          />
        </div>
      </div>
    </Sheet>
  );
}
