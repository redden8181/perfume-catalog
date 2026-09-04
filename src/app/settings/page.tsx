import type { Metadata } from "next";
import { SettingsClient } from "@/components/pages/SettingsClient";

export const metadata: Metadata = {
  title: "Ещё",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
