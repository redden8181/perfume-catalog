import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FlaskConical, Heart, Star } from "lucide-react";
import type { Note, Perfume } from "../core/types";
import { GENDER_SHORT } from "../core/types";
import { perfumeAllNoteIds } from "../core/filter";
import { catalog } from "../core/catalogStore";
import { cn } from "../utils/cn";

export function PerfumeCard({
  perfume,
  notesMap,
  index,
}: {
  perfume: Perfume;
  notesMap: Map<string, Note>;
  index: number;
}) {
  const noteNames = perfumeAllNoteIds(perfume)
    .map((id) => notesMap.get(id)?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(" · ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.045, 0.35), duration: 0.45, ease: "easeOut" }}
    >
      <Link to={`/perfume/${perfume.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] border border-line bg-card shadow-sm shadow-black/5">
          {perfume.image ? (
            <img
              src={perfume.image}
              alt={perfume.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-lift to-card text-gold/40">
              <FlaskConical size={44} strokeWidth={1} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              catalog.toggleFavorite(perfume.id);
            }}
            aria-label="В избранное"
            className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/45 backdrop-blur-md transition active:scale-90"
          >
            <Heart
              size={17}
              className={cn(
                "transition",
                perfume.favorite ? "fill-gold text-gold" : "text-white/90"
              )}
            />
          </button>

          {perfume.rating > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur-md">
              <Star size={11} className="fill-gold text-gold" />
              <span className="text-[11px] font-semibold text-white">{perfume.rating}</span>
            </div>
          )}
        </div>

        <div className="px-1 pt-2.5">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
            {perfume.brand}
          </p>
          <h3 className="mt-0.5 truncate font-display text-[16px] leading-snug text-cream">
            {perfume.name}
          </h3>
          {noteNames && (
            <p className="mt-1 truncate text-[11px] text-muted">{noteNames}</p>
          )}
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted/70">
            {[GENDER_SHORT[perfume.gender], perfume.year].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
