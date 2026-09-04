import type { Metadata } from "next";
import { FavoritesClient } from "@/components/pages/FavoritesClient";

export const metadata: Metadata = {
  title: "Избранное",
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
