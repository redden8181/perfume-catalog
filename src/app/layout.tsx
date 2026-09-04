import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ароматека — личный каталог парфюмерии",
    template: "%s · Ароматека",
  },
  description:
    "Личный каталог парфюмерии: подбор ароматов по нотам, фильтры, избранное и личные заметки. Работает офлайн, данные хранятся на вашем устройстве.",
  applicationName: "Ароматека",
  appleWebApp: {
    capable: true,
    title: "Ароматека",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="bg-ink font-sans text-ivory antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
