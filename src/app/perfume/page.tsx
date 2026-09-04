import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailClient } from "@/components/pages/DetailClient";

export const metadata: Metadata = {
  title: "Аромат",
};

export default function PerfumePage() {
  return (
    <Suspense fallback={<div className="py-24" />}>
      <DetailClient />
    </Suspense>
  );
}
