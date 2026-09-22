import { Heart } from "lucide-react";
import { useBrands } from "../hooks/useCatalog";
import { useFilters } from "../state/FilterContext";
import { GENDER_LABELS, type Gender } from "../core/types";
import { Chip, FieldLabel, GhostButton, GoldButton, Sheet, StarRating, Switch } from "./ui";

/**
 * Продвинутые фильтры: бренды, пол, год, минимальный рейтинг, избранное.
 * resultCount — живой предпросмотр («Показать · N»).
 */
export function FilterSheet({
  open,
  onClose,
  resultCount,
  fixedFavorites,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  fixedFavorites?: boolean;
}) {
  const { query, patch, resetAdvanced } = useFilters();
  const brands = useBrands();

  const toggleIn = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const parseYear = (v: string): number | null => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Фильтры"
      footer={
        <div className="grid grid-cols-[1fr_1.4fr] gap-3">
          <GhostButton
            onClick={() => {
              resetAdvanced();
            }}
          >
            Сбросить
          </GhostButton>
          <GoldButton onClick={onClose}>Показать · {resultCount}</GoldButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-2">
        {!fixedFavorites && (
          <Switch
            checked={query.favoritesOnly}
            onChange={(v) => patch({ favoritesOnly: v })}
            label="Только избранное"
            icon={<Heart size={16} className={query.favoritesOnly ? "fill-gold text-gold" : "text-muted"} />}
          />
        )}

        <section>
          <FieldLabel>Бренд</FieldLabel>
          {brands.length === 0 ? (
            <p className="text-[13px] text-muted">Бренды появятся после добавления парфюмов</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <Chip
                  key={b}
                  label={b}
                  selected={query.brands.includes(b)}
                  onClick={() => patch({ brands: toggleIn(query.brands, b) })}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <FieldLabel>Пол</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
              <Chip
                key={g}
                label={GENDER_LABELS[g]}
                selected={query.genders.includes(g)}
                onClick={() => patch({ genders: toggleIn(query.genders, g) })}
              />
            ))}
          </div>
        </section>

        <section>
          <FieldLabel>Рейтинг — не ниже</FieldLabel>
          <StarRating
            value={query.minRating}
            onChange={(v) => patch({ minRating: v })}
            size={20}
          />
        </section>

        <section>
          <FieldLabel>Год выпуска</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="от"
              value={query.yearFrom ?? ""}
              onChange={(e) => patch({ yearFrom: parseYear(e.target.value) })}
              className="h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] text-cream outline-none placeholder:text-muted/60 focus:border-gold/40"
            />
            <span className="text-muted">—</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="до"
              value={query.yearTo ?? ""}
              onChange={(e) => patch({ yearTo: parseYear(e.target.value) })}
              className="h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] text-cream outline-none placeholder:text-muted/60 focus:border-gold/40"
            />
          </div>
        </section>
      </div>
    </Sheet>
  );
}
