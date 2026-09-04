"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { useMemo } from "react";
import { useCatalog } from "@/core/catalog-store";
import { sortPerfumes } from "@/core/filter";
import { PageHeader } from "@/components/PageHeader";
import { PerfumeCard } from "@/components/PerfumeCard";
import { EmptyState } from "@/components/ui";

export function FavoritesClient() {
  const { perfumes } = useCatalog();
  const favorites = useMemo(
    () => sortPerfumes(perfumes.filter((p) => p.favorite), "updated"),
    [perfumes],
  );

  return (
    <div>
      <PageHeader
        title="Избранное"
        subtitle={
          favorites.length > 0
            ? `${favorites.length} ${plural(favorites.length)} в вашей личной подборке`
            : undefined
        }
      />
      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Пока пусто"
          text="Отмечайте ароматы сердечком — они соберутся здесь в отдельную подборку."
        >
          <Link
            href="/"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-b from-gold-2 to-gold px-6 text-[15px] font-bold text-[#1c1610]"
          >
            <Plus className="h-5 w-5" />
            Перейти в каталог
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {favorites.map((p, i) => (
            <PerfumeCard key={p.id} perfume={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "аромат";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "аромата";
  return "ароматов";
}
