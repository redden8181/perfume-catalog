import type { Metadata } from "next";
import { Suspense } from "react";
import { EditClient } from "@/components/pages/EditClient";

export const metadata: Metadata = {
  title: "Редактирование",
};

export default function EditPage() {
  return (
    <Suspense fallback={<div className="py-24" />}>
      <EditClient />
    </Suspense>
  );
}
