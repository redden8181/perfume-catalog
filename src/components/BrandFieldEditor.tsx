"use client";

import { Building2, Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useCatalog } from "@/core/catalog-store";
import { displayName, normalizeName } from "@/core/utils";

/**
 * Автодополнение бренда: выбор существующего или создание нового.
 * В форме хранится строка-имя; в сущность превращается при сохранении.
 */
export function BrandFieldEditor({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (name: string) => void;
  invalid?: boolean;
}) {
  const { brands } = useCatalog();
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = normalizeName(value);
    return brands
      .filter((b) => (q ? b.normalized.includes(q) : true))
      .sort((a, b) => {
        if (!q) return a.name.localeCompare(b.name, "ru-RU");
        const as = a.normalized.startsWith(q) ? 0 : 1;
        const bs = b.normalized.startsWith(q) ? 0 : 1;
        return as - bs || a.name.localeCompare(b.name, "ru-RU");
      })
      .slice(0, 6);
  }, [brands, value]);

  const exactExists = brands.some((b) => b.normalized === normalizeName(value));
  const canCreate = value.trim().length > 0 && !exactExists;

  return (
    <div className="relative">
      <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" />
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 140)}
        placeholder="Например, Maison Noir"
        aria-invalid={invalid}
        className={
          "h-12 w-full rounded-2xl border bg-surface pl-12 pr-4 text-base text-ivory placeholder:text-faint focus:outline-none " +
          (invalid ? "border-wine/70 focus:border-wine" : "border-line focus:border-gold/50")
        }
      />
      {focused && (suggestions.length > 0 || canCreate) && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line-2 bg-ink-2 shadow-card animate-pop-in">
          <ul className="max-h-56 overflow-y-auto py-1">
            {canCreate && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(displayName(value));
                    ref.current?.blur();
                  }}
                  className="flex min-h-11 w-full items-center gap-2.5 px-4 text-left text-[15px] font-semibold text-gold-2 active:bg-gold/10"
                >
                  <Plus className="h-5 w-5 shrink-0" />
                  Создать «{displayName(value)}»
                </button>
              </li>
            )}
            {suggestions.map((brand) => (
              <li key={brand.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(brand.name);
                    ref.current?.blur();
                  }}
                  className="flex min-h-11 w-full items-center px-4 text-left text-[15px] text-ivory active:bg-surface-2"
                >
                  {brand.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
