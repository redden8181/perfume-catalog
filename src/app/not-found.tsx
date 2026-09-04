import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface">
        <SearchX className="h-7 w-7 text-gold/80" />
      </div>
      <h1 className="font-display text-4xl font-semibold text-ivory">Страница не найдена</h1>
      <p className="max-w-xs text-sm leading-relaxed text-muted">
        Такого адреса нет в Ароматеке. Вернитесь в каталог и продолжите поиск.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-12 items-center rounded-full bg-gradient-to-b from-gold-2 to-gold px-7 text-[15px] font-bold text-[#1c1610]"
      >
        В каталог
      </Link>
    </div>
  );
}
