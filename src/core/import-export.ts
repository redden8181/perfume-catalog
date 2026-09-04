import {
  CATALOG_VERSION,
  DEFAULT_SETTINGS,
  type CatalogData,
  type Gender,
  type NoteTier,
  type Perfume,
} from "./types";
import { clamp, displayName, normalizeName, uid } from "./utils";

/** Экспорт каталога в читаемый JSON. */
export function exportCatalog(data: CatalogData): string {
  return JSON.stringify(
    {
      ...data,
      version: CATALOG_VERSION,
      meta: { ...data.meta, exportedAt: Date.now() },
    },
    null,
    2,
  );
}

export interface ImportResult {
  ok: boolean;
  error?: string;
  data?: CatalogData;
  counts?: { perfumes: number; notes: number; brands: number };
}

const GENDERS: Gender[] = ["male", "female", "unisex"];
const TIERS: NoteTier[] = ["top", "heart", "base"];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asIdArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/**
 * Разбор и нормализация импортированного JSON:
 *  - дедупликация нот и брендов по нормализованному имени
 *    («Малина» + «малина» сольются в одну запись);
 *  - перегенерация конфликтующих id;
 *  - отбрасывание ссылок на несуществующие ноты/бренды;
 *  - значения по умолчанию для отсутствующих полей.
 */
export function parseImportedCatalog(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "Файл не является корректным JSON." };
  }
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Неверная структура файла: ожидался объект каталога." };
  }
  const source = raw as Partial<CatalogData>;
  if (!Array.isArray(source.perfumes)) {
    return { ok: false, error: "В файле нет массива «perfumes» — это не каталог Ароматеки." };
  }

  const usedIds = new Set<string>();
  const freshId = (prefix: string) => {
    let id = uid(prefix);
    while (usedIds.has(id)) id = uid(prefix);
    usedIds.add(id);
    return id;
  };

  // --- Ноты: дедупликация по нормализованному имени ---
  const noteIdByNormalized = new Map<string, string>();
  const notes: CatalogData["notes"] = [];
  const noteIdRemap = new Map<string, string>();

  const rawNotes = Array.isArray(source.notes) ? source.notes : [];
  for (const rawNote of rawNotes) {
    const nr = rawNote as { id?: unknown; name?: unknown };
    const name = displayName(asString(nr.name));
    if (!name) continue;
    const normalized = normalizeName(name);
    const oldId = asString(nr.id);
    const existing = noteIdByNormalized.get(normalized);
    if (existing) {
      if (oldId) noteIdRemap.set(oldId, existing);
      continue;
    }
    const id = freshId("note");
    noteIdByNormalized.set(normalized, id);
    if (oldId) noteIdRemap.set(oldId, id);
    notes.push({ id, name, normalized });
  }

  // --- Бренды: аналогично ---
  const brandIdByNormalized = new Map<string, string>();
  const brands: CatalogData["brands"] = [];
  const rawBrands = Array.isArray(source.brands) ? source.brands : [];
  for (const rawBrand of rawBrands) {
    const br = rawBrand as { name?: unknown };
    const name = displayName(asString(br.name));
    if (!name) continue;
    const normalized = normalizeName(name);
    if (brandIdByNormalized.has(normalized)) continue;
    const id = freshId("brand");
    brandIdByNormalized.set(normalized, id);
    brands.push({ id, name, normalized });
  }
  const brandNameToId = new Map(brands.map((b) => [b.normalized, b.id]));
  const validBrandIds = new Set(brands.map((b) => b.id));
  const validNoteIds = new Set(notes.map((n) => n.id));

  // --- Парфюмы ---
  const perfumes: Perfume[] = [];
  for (const rawPerfume of source.perfumes) {
    const p = rawPerfume as Partial<Perfume> & { brandName?: unknown };
    const name = asString(p.name).trim();
    if (!name) continue;

    let brandId = asString(p.brandId);
    if (!validBrandIds.has(brandId)) {
      const fromName = brandNameToId.get(normalizeName(asString(p.brandName)));
      if (fromName) {
        brandId = fromName;
      } else if (brands.length > 0) {
        brandId = brands[0].id;
      } else {
        const id = freshId("brand");
        const fallbackName = "Без бренда";
        brands.push({ id, name: fallbackName, normalized: normalizeName(fallbackName) });
        validBrandIds.add(id);
        brandNameToId.set(normalizeName(fallbackName), id);
        brandId = id;
      }
    }

    const rawYear =
      typeof p.year === "number" && Number.isFinite(p.year) ? Math.trunc(p.year) : null;
    const year = rawYear !== null && rawYear >= 1800 && rawYear <= 2100 ? rawYear : null;
    const rawRating = typeof p.rating === "number" ? p.rating : 0;
    const gender = GENDERS.includes(p.gender as Gender) ? (p.gender as Gender) : "unisex";

    const notesPyramid = TIERS.reduce<Perfume["notes"]>(
      (acc, tier) => {
        const ids = asIdArray(p.notes?.[tier])
          .map((id) => noteIdRemap.get(id) ?? id)
          .filter((id) => validNoteIds.has(id));
        acc[tier] = Array.from(new Set(ids));
        return acc;
      },
      { top: [], heart: [], base: [] },
    );

    const now = Date.now();
    perfumes.push({
      id: freshId("perfume"),
      brandId,
      name,
      gender,
      year,
      image: typeof p.image === "string" && p.image.length > 0 ? p.image : null,
      notes: notesPyramid,
      description: asString(p.description),
      characteristics: asString(p.characteristics),
      personalNotes: asString(p.personalNotes),
      rating: clamp(Math.round(rawRating), 0, 5),
      favorite: p.favorite === true,
      createdAt: typeof p.createdAt === "number" ? p.createdAt : now,
      updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : now,
    });
  }

  const data: CatalogData = {
    version: CATALOG_VERSION,
    perfumes,
    notes,
    brands,
    settings: { ...DEFAULT_SETTINGS, ...(source.settings ?? {}), theme: "dark" },
    meta: { createdAt: Date.now(), seeded: true },
  };

  return {
    ok: true,
    data,
    counts: { perfumes: perfumes.length, notes: notes.length, brands: brands.length },
  };
}
