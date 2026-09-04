"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCatalog } from "@/core/catalog-store";
import type { Gender, Perfume } from "@/core/types";
import { GENDER_LABELS, TIER_LABELS } from "@/core/types";
import { BrandFieldEditor } from "./BrandFieldEditor";
import { ImagePicker } from "./ImagePicker";
import { NoteFieldEditor } from "./NoteFieldEditor";
import { Field, GhostButton, GoldButton, RatingStars, Segmented, TextArea, TextInput, Toggle } from "./ui";

const GENDER_OPTIONS = (["female", "male", "unisex"] as Gender[]).map((g) => ({
  value: g,
  label: GENDER_LABELS[g],
}));

export function PerfumeForm({ initial }: { initial?: Perfume }) {
  const router = useRouter();
  const catalog = useCatalog();
  const { ensureBrand, addPerfume, updatePerfume } = catalog;
  const initialBrandName = initial
    ? (catalog.getBrand(initial.brandId)?.name ?? "")
    : "";

  const [name, setName] = useState(initial?.name ?? "");
  const [brandName, setBrandName] = useState(initialBrandName);
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "unisex");
  const [year, setYear] = useState(initial?.year?.toString() ?? "");
  const [image, setImage] = useState<string | null>(initial?.image ?? null);
  const [topIds, setTopIds] = useState<string[]>(initial?.notes.top ?? []);
  const [heartIds, setHeartIds] = useState<string[]>(initial?.notes.heart ?? []);
  const [baseIds, setBaseIds] = useState<string[]>(initial?.notes.base ?? []);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [characteristics, setCharacteristics] = useState(initial?.characteristics ?? "");
  const [personalNotes, setPersonalNotes] = useState(initial?.personalNotes ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [favorite, setFavorite] = useState(initial?.favorite ?? false);
  const [errors, setErrors] = useState<{ name?: string; brand?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Укажите название парфюма.";
    if (!brandName.trim()) nextErrors.brand = "Укажите бренд.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const brand = ensureBrand(brandName);
    if (!brand) return;

    const yearNum = Number.parseInt(year, 10);
    const input = {
      brandId: brand.id,
      name: name.trim(),
      gender,
      year: Number.isFinite(yearNum) && yearNum >= 1800 && yearNum <= 2100 ? yearNum : null,
      image,
      notes: { top: topIds, heart: heartIds, base: baseIds },
      description: description.trim(),
      characteristics: characteristics.trim(),
      personalNotes: personalNotes.trim(),
      rating,
      favorite,
    };

    if (initial) {
      updatePerfume(initial.id, input);
      router.replace(`/perfume?id=${encodeURIComponent(initial.id)}`);
    } else {
      const created = addPerfume(input);
      router.replace(`/perfume?id=${encodeURIComponent(created.id)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <Field label="Фото флакона">
        <ImagePicker value={image} onChange={setImage} seed={`${brandName} ${name}`} />
      </Field>

      <Field label="Бренд" error={errors.brand}>
        <BrandFieldEditor value={brandName} onChange={setBrandName} invalid={Boolean(errors.brand)} />
      </Field>

      <Field label="Название" error={errors.name}>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Framboise Nuit"
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      <Field label="Пол">
        <Segmented options={GENDER_OPTIONS} value={gender} onChange={setGender} />
      </Field>

      <Field label="Год выпуска">
        <TextInput
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
          inputMode="numeric"
          placeholder="2021"
        />
      </Field>

      <Field label={TIER_LABELS.top}>
        <NoteFieldEditor noteIds={topIds} onChange={setTopIds} placeholder="Например, малина…" />
      </Field>

      <Field label={TIER_LABELS.heart}>
        <NoteFieldEditor noteIds={heartIds} onChange={setHeartIds} placeholder="Например, роза…" />
      </Field>

      <Field label={TIER_LABELS.base}>
        <NoteFieldEditor noteIds={baseIds} onChange={setBaseIds} placeholder="Например, мускус…" />
      </Field>

      <Field label="Описание">
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Общее впечатление, характер, ассоциации…"
        />
      </Field>

      <Field label="Дополнительные характеристики" hint="Стойкость, шлейф, сезон, время суток">
        <TextArea
          value={characteristics}
          onChange={(e) => setCharacteristics(e.target.value)}
          placeholder="Стойкость 8 часов, плотный шлейф, осень–зима…"
          className="min-h-20"
        />
      </Field>

      <Field label="Мои заметки" hint="Личное: где тестировали, кому напоминает, купить ли">
        <TextArea
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="Очень понравился. Купить позже…"
          className="min-h-20"
        />
      </Field>

      <Field label="Мой рейтинг">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
          <RatingStars value={rating} onChange={setRating} size={26} />
          <span className="text-sm text-faint">{rating > 0 ? `${rating}/5` : "без оценки"}</span>
        </div>
      </Field>

      <div className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3.5">
        <span className="text-[15px] font-medium text-ivory">В избранном</span>
        <Toggle checked={favorite} onChange={setFavorite} label="В избранном" />
      </div>

      <div className="flex flex-col gap-2.5 pt-2 pb-4">
        <GoldButton type="submit" className="w-full">
          {initial ? "Сохранить изменения" : "Добавить в каталог"}
        </GoldButton>
        <GhostButton type="button" onClick={() => router.back()} className="w-full">
          Отмена
        </GhostButton>
      </div>
    </form>
  );
}
