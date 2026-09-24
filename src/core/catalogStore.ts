import type {
  CatalogSnapshot,
  Gender,
  Note,
  Perfume,
  PerfumeDraft,
} from "./types";
import type { StorageAdapter } from "./storage";
import { LocalStorageAdapter } from "./storage";
import { buildSeed } from "./seed";
import { clamp, displayNoteName, normalizeNoteName, noteKey, uid } from "./utils";

/**
 * Хранилище каталога — единственная точка правды.
 * UI подписывается на него через useSyncExternalStore (см. hooks/useCatalog).
 * Хранилище ничего не знает про React; при переходе на API достаточно
 * заменить StorageAdapter (см. core/storage.ts).
 */

type Listener = () => void;

const EXPORT_APP = "aromateka";
const EXPORT_VERSION = 1;

export interface ImportResult {
  perfumes: number;
  notes: number;
  mode: "replace" | "merge";
}

interface ExportFile {
  app: string;
  version: number;
  exportedAt: string;
  notes: Note[];
  perfumes: Perfume[];
}

const GENDERS: Gender[] = ["male", "female", "unisex"];

export class CatalogStore {
  private state: CatalogSnapshot;
  private listeners = new Set<Listener>();

  constructor(
    private storage: StorageAdapter,
    seedFactory: () => CatalogSnapshot
  ) {
    const restored = this.loadFromStorage();
    this.state = restored ?? seedFactory();
    if (!restored) this.persist();
  }

  /* ---------- реактивность ---------- */

  getSnapshot = (): CatalogSnapshot => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit() {
    for (const l of this.listeners) l();
  }

  private commit(next: CatalogSnapshot) {
    this.state = next;
    this.persist();
    this.emit();
  }

  private persist() {
    this.storage.save(JSON.stringify(this.state));
  }

  private loadFromStorage(): CatalogSnapshot | null {
    const raw = this.storage.load();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as CatalogSnapshot;
      if (Array.isArray(parsed.notes) && Array.isArray(parsed.perfumes)) {
        return parsed;
      }
    } catch {
      /* повреждённые данные — начнём с демо */
    }
    return null;
  }

  /* ---------- ноты ---------- */

  /** Ищет ноту по имени без учёта регистра */
  findNoteByName(name: string): Note | undefined {
    const key = noteKey(name);
    return this.state.notes.find((n) => noteKey(n.name) === key);
  }

  /**
   * Добавляет ноту. «Малина» и «малина» — одна и та же сущность:
   * при совпадении возвращается существующая нота, дубликат не создаётся.
   */
  addNote(name: string): Note | null {
    const clean = normalizeNoteName(name);
    if (!clean) return null;
    const existing = this.findNoteByName(clean);
    if (existing) return existing;
    const note: Note = { id: uid(), name: displayNoteName(clean), image: null, preference: "neutral", createdAt: Date.now() };
    const notes = [...this.state.notes, note].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    this.commit({ ...this.state, notes });
    return note;
  }

  /** Обновить данные ноты */
  updateNote(id: string, patch: Partial<Omit<Note, "id" | "createdAt">>): void {
    const notes = this.state.notes.map((n) => {
      if (n.id !== id) return n;
      const updated = { ...n, ...patch };
      if (patch.name) {
        const clean = normalizeNoteName(patch.name);
        if (clean) updated.name = displayNoteName(clean);
      }
      return updated;
    });
    if (patch.name) {
      notes.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    }
    this.commit({ ...this.state, notes });
  }

  /** Удалить ноты, которые не используются ни одним парфюмом. Возвращает число удалённых. */
  pruneUnusedNotes(): number {
    const used = new Set<string>();
    for (const p of this.state.perfumes) {
      p.notes.top.forEach((id) => used.add(id));
      p.notes.heart.forEach((id) => used.add(id));
      p.notes.base.forEach((id) => used.add(id));
    }
    const notes = this.state.notes.filter((n) => used.has(n.id));
    const removed = this.state.notes.length - notes.length;
    if (removed > 0) this.commit({ ...this.state, notes });
    return removed;
  }

  /* ---------- парфюмы ---------- */

  getPerfume(id: string): Perfume | undefined {
    return this.state.perfumes.find((p) => p.id === id);
  }

  addPerfume(draft: PerfumeDraft): Perfume {
    const now = Date.now();
    const perfume: Perfume = {
      ...draft,
      brand: draft.brand.trim(),
      name: draft.name.trim(),
      id: uid(),
      createdAt: now,
      updatedAt: now,
    };
    this.commit({ ...this.state, perfumes: [perfume, ...this.state.perfumes] });
    return perfume;
  }

  updatePerfume(id: string, patch: Partial<PerfumeDraft>): void {
    const perfumes = this.state.perfumes.map((p) => {
      if (p.id !== id) return p;
      const merged = { ...p, ...patch };
      return {
        ...merged,
        brand: merged.brand.trim(),
        name: merged.name.trim(),
        updatedAt: Date.now(),
      };
    });
    this.commit({ ...this.state, perfumes });
  }

  removePerfume(id: string): void {
    this.commit({
      ...this.state,
      perfumes: this.state.perfumes.filter((p) => p.id !== id),
    });
  }

  toggleFavorite(id: string): void {
    const p = this.getPerfume(id);
    if (p) this.updatePerfume(id, { favorite: !p.favorite });
  }

  setRating(id: string, rating: number): void {
    this.updatePerfume(id, { rating: clamp(Math.round(rating), 0, 5) });
  }

  /* ---------- импорт / экспорт ---------- */

  exportJSON(): string {
    const payload: ExportFile = {
      app: EXPORT_APP,
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      notes: this.state.notes,
      perfumes: this.state.perfumes,
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Импорт каталога из JSON.
   * replace — полностью заменить текущий каталог; merge — объединить
   * (парфюмы с совпадающими id перезаписываются, ноты склеиваются по имени).
   */
  importJSON(raw: string, mode: "replace" | "merge"): ImportResult {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Файл не является корректным JSON");
    }
    const incoming = sanitizeImport(parsed);

    if (mode === "replace") {
      this.commit(incoming);
      return { perfumes: incoming.perfumes.length, notes: incoming.notes.length, mode };
    }

    // merge: ноты объединяем по имени (без учёта регистра), id импортированных
    // нот перепривязываем к уже существующим сущностям
    const notes = [...this.state.notes];
    const idRemap = new Map<string, string>();
    for (const n of incoming.notes) {
      const existing = notes.find((x) => noteKey(x.name) === noteKey(n.name));
      if (existing) {
        idRemap.set(n.id, existing.id);
      } else {
        notes.push(n);
        idRemap.set(n.id, n.id);
      }
    }
    notes.sort((a, b) => a.name.localeCompare(b.name, "ru"));

    const remapIds = (ids: string[]) => ids.map((id) => idRemap.get(id) ?? id);
    const perfumes = [...this.state.perfumes];
    for (const p of incoming.perfumes) {
      const remapped: Perfume = {
        ...p,
        notes: {
          top: remapIds(p.notes.top),
          heart: remapIds(p.notes.heart),
          base: remapIds(p.notes.base),
        },
      };
      const idx = perfumes.findIndex((x) => x.id === p.id);
      if (idx >= 0) perfumes[idx] = remapped;
      else perfumes.push(remapped);
    }

    this.commit({ notes, perfumes });
    return {
      perfumes: incoming.perfumes.length,
      notes: incoming.notes.length,
      mode,
    };
  }

  /* ---------- сервис ---------- */

  resetToSeed(): void {
    this.commit(buildSeed());
  }

  clearAll(): void {
    this.commit({ notes: [], perfumes: [] });
  }

  /** Оценка занятого места (байт) */
  dataSize(): number {
    try {
      return JSON.stringify(this.state).length;
    } catch {
      return 0;
    }
  }
}

/* ---------- валидация импорта ---------- */

function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asIdArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function sanitizeImport(data: unknown): CatalogSnapshot {
  if (typeof data !== "object" || data === null) {
    throw new Error("Файл не похож на экспорт каталога");
  }
  const d = data as { notes?: unknown; perfumes?: unknown };
  if (!Array.isArray(d.perfumes)) {
    throw new Error("В файле нет списка парфюмов");
  }

  const notes: Note[] = (Array.isArray(d.notes) ? d.notes : [])
    .map((n): Note | null => {
      if (typeof n !== "object" || n === null) return null;
      const rec = n as Record<string, unknown>;
      const name = asStr(rec.name).trim();
      if (!name) return null;
      return {
        id: asStr(rec.id) || uid(),
        name,
        image: typeof rec.image === "string" && rec.image ? rec.image : null,
        preference: ["like", "dislike", "neutral"].includes(rec.preference as string) ? (rec.preference as Note["preference"]) : "neutral",
        createdAt: typeof rec.createdAt === "number" ? rec.createdAt : Date.now(),
      };
    })
    .filter((n): n is Note => n !== null);

  const noteIds = new Set(notes.map((n) => n.id));
  const filterIds = (ids: string[]) => ids.filter((id) => noteIds.has(id));

  const perfumes: Perfume[] = d.perfumes
    .map((p): Perfume | null => {
      if (typeof p !== "object" || p === null) return null;
      const rec = p as Record<string, unknown>;
      const name = asStr(rec.name).trim();
      const brand = asStr(rec.brand).trim();
      if (!name && !brand) return null;
      const rawNotes = (typeof rec.notes === "object" && rec.notes !== null
        ? rec.notes
        : {}) as Record<string, unknown>;
      return {
        id: asStr(rec.id) || uid(),
        name,
        brand,
        gender: GENDERS.includes(rec.gender as Gender) ? (rec.gender as Gender) : "unisex",
        year: typeof rec.year === "number" ? rec.year : null,
        image: typeof rec.image === "string" && rec.image ? rec.image : null,
        notes: {
          top: filterIds(asIdArray(rawNotes.top)),
          heart: filterIds(asIdArray(rawNotes.heart)),
          base: filterIds(asIdArray(rawNotes.base)),
        },
        description: asStr(rec.description),
        characteristics: asStr(rec.characteristics),
        personalNotes: asStr(rec.personalNotes),
        rating: clamp(typeof rec.rating === "number" ? rec.rating : 0, 0, 5),
        favorite: rec.favorite === true,
        createdAt: typeof rec.createdAt === "number" ? rec.createdAt : Date.now(),
        updatedAt: typeof rec.updatedAt === "number" ? rec.updatedAt : Date.now(),
      };
    })
    .filter((p): p is Perfume => p !== null);

  return { notes, perfumes };
}

/** Готовый синглтон приложения */
export const catalog = new CatalogStore(new LocalStorageAdapter(), buildSeed);
