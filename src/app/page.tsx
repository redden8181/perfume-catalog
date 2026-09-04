import { Suspense } from "react";
import { HomeClient } from "@/components/pages/HomeClient";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="py-24" />}>
      <HomeClient />
    </Suspense>
  );
}
