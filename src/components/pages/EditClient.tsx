"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { useCatalog } from "@/core/catalog-store";
import { PageHeader } from "@/components/PageHeader";
import { PerfumeForm } from "@/components/PerfumeForm";
import { EmptyState } from "@/components/ui";

export function EditClient() {
  const { getPerfume } = useCatalog();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const perfume = getPerfume(id);

  if (!perfume) {
    return (
      <EmptyState icon={SearchX} title="Аромат не найден" text="Возможно, он был удалён.">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-full bg-gradient-to-b from-gold-2 to-gold px-6 text-[15px] font-bold text-[#1c1610]"
        >
          В каталог
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader back title="Редактировать" subtitle={perfume.name} />
      <PerfumeForm key={perfume.id} initial={perfume} />
    </div>
  );
}
