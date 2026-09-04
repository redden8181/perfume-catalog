"use client";

import { PageHeader } from "@/components/PageHeader";
import { PerfumeForm } from "@/components/PerfumeForm";

export function AddClient() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader back title="Новый аромат" subtitle="Заполните то, что знаете — остальное можно дописать позже" />
      <PerfumeForm />
    </div>
  );
}
