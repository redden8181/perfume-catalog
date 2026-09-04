"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useCatalog } from "@/core/catalog-store";
import type { Perfume } from "@/core/types";
import { GENDER_LABELS } from "@/core/types";
import { cn } from "@/core/utils";
import { ImageOrPlaceholder } from "./ImageOrPlaceholder";
import { NoteTag } from "./NotesChips";
import { RatingStars } from "./ui";

export function PerfumeCard({ perfume, index = 0 }: { perfume: Perfume; index?: number }) {
  const { getBrand, getNote, toggleFavorite } = useCatalog();
  const brand = getBrand(perfume.brandId);

  const noteNames = [...perfume.notes.top, ...perfume.notes.heart, ...perfume.notes.base]
    .map((id) => getNote(id)?.name)
    .filter((n): n is string => Boolean(n));
  const uniqueNotes = Array.from(new Set(noteNames));

  return (
    <Link
      href={`/perfume?id=${encodeURIComponent(perfume.id)}`}
      prefetch={false}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-transform duration-300 animate-fade-up hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="relative overflow-hidden">
        <ImageOrPlaceholder
          src={perfume.image}
          seed={`${brand?.name ?? ""} ${perfume.name}`}
          label={perfume.name}
          className="relative flex aspect-[4/5] w-full items-center justify-center"
          imgClassName="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <button
          type="button"
          aria-label={perfume.favorite ? "Убрать из избранного" : "В избранное"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(perfume.id);
          }}
          className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 backdrop-blur-md transition-transform active:scale-90"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              perfume.favorite ? "fill-wine text-wine" : "text-ivory/85",
            )}
          />
        </button>
        {perfume.rating > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2.5 py-1.5 backdrop-blur-md">
            <RatingStars value={perfume.rating} size={11} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold/85">
          {brand?.name ?? "Без бренда"}
        </p>
        <h3 className="font-display text-[19px] font-semibold leading-tight text-ivory">
          {perfume.name}
        </h3>
        <p className="text-xs text-faint">
          {GENDER_LABELS[perfume.gender]}
          {perfume.year ? ` · ${perfume.year}` : ""}
        </p>
        {uniqueNotes.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {uniqueNotes.slice(0, 3).map((name) => (
              <NoteTag key={name} name={name} />
            ))}
            {uniqueNotes.length > 3 && (
              <span className="inline-flex items-center rounded-full px-1.5 py-1 text-[11px] font-semibold text-gold/80">
                +{uniqueNotes.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
