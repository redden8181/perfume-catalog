import type { Metadata } from "next";
import { AddClient } from "@/components/pages/AddClient";

export const metadata: Metadata = {
  title: "Добавить аромат",
};

export default function AddPage() {
  return <AddClient />;
}
