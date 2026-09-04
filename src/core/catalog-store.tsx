"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { exportCatalog, parseImportedCatalog, type ImportResult } from "./import-export";
import { createEmptyCatalog, createSeedData } from "./seed";
import { getCatalogStorage, type CatalogStorage } from "./storage";
import type {
  Brand,
  CatalogData,
  Note,
  NoteFilterMode,
  Perfume,
  PerfumeInput,
} from "./types";
import { displayName, normalizeName, uid } from "./utils";

export interface CatalogStore {
  ready: boolean;
  data: CatalogData;
  perfumes: Perfume[];
  notes: Note[];
  brands: Brand[];
  getPerfume(id: string): Perfume | undefined;
  getNote(id: string): Note | undefined;
  getBrand(id: string): Brand | undefined;
  /** Найти ноту по имени или создать новую. «малина» ≡ «Малина». */
  ensureNote(name: string): Note | null;
  ensureBrand(name: string): Brand | null;
  addPerfume(input: PerfumeInput): Perfume;
  updatePerfume(id: string, input: PerfumeInput): void;
  patchPerfume(id: string, patch: Partial<Pick<Perfume, "personalNotes" | "rating">>): void;
  removePerfume(id: string): void;
  toggleFavorite(id: string): void;
  setNoteFilterMode(mode: NoteFilterMode): void;
  exportJson(): string;
  importJson(text: string): ImportResult;
  resetCatalog(): void;
  seedDemoData(): void;
}

const CatalogContext = createContext<CatalogStore | null>(null);

type Updater = (prev: CatalogData) => CatalogData;

export function CatalogProvider({ children }: { children: ReactNode }) {
  const storageRef = useRef<CatalogStorage | null>(null);
  const [data, setData] = useState<CatalogData | null>(null);

  /**
   * Все мутации идут через функциональный апдейтер:
   * несколько вызовов подряд (например, ensureBrand → addPerfume
   * в одном submit) корректно накладываются друг на друга.
   */
  const commit = useCallback((updater: Updater) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      void storageRef.current?.save(next);
      return next;
    });
  }, []);

  // Первичная загрузка: localStorage → seed при первом запуске.
  useEffect(() => {
    let cancelled = false;
    const storage = getCatalogStorage();
    storageRef.current = storage;
    void storage.load().then((loaded) => {
      if (cancelled) return;
      if (loaded) {
        setData(loaded);
      } else {
        const seeded = createSeedData();
        void storage.save(seeded);
        setData(seeded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Синхронизация между вкладками браузера.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (!event.key || !event.key.startsWith("aromateka.")) return;
      void storageRef.current?.load().then((loaded) => {
        if (loaded) setData(loaded);
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const ensureNote = useCallback(
    (name: string): Note | null => {
      const shown = displayName(name);
      if (!shown) return null;
      const normalized = normalizeName(shown);
      const existing = data?.notes.find((n) => n.normalized === normalized);
      if (existing) return existing;
      const created: Note = { id: uid("note"), name: shown, normalized };
      commit((prev) => {
        if (prev.notes.some((n) => n.normalized === normalized)) return prev;
        return { ...prev, notes: [...prev.notes, created] };
      });
      return created;
    },
    [data, commit],
  );

  const ensureBrand = useCallback(
    (name: string): Brand | null => {
      const shown = displayName(name);
      if (!shown) return null;
      const normalized = normalizeName(shown);
      const existing = data?.brands.find((b) => b.normalized === normalized);
      if (existing) return existing;
      const created: Brand = { id: uid("brand"), name: shown, normalized };
      commit((prev) => {
        if (prev.brands.some((b) => b.normalized === normalized)) return prev;
        return { ...prev, brands: [...prev.brands, created] };
      });
      return created;
    },
    [data, commit],
  );

  const addPerfume = useCallback(
    (input: PerfumeInput): Perfume => {
      const now = Date.now();
      const perfume: Perfume = { ...input, id: uid("perfume"), createdAt: now, updatedAt: now };
      commit((prev) => ({ ...prev, perfumes: [perfume, ...prev.perfumes] }));
      return perfume;
    },
    [commit],
  );

  const updatePerfume = useCallback(
    (id: string, input: PerfumeInput) => {
      commit((prev) => ({
        ...prev,
        perfumes: prev.perfumes.map((p) =>
          p.id === id ? { ...p, ...input, updatedAt: Date.now() } : p,
        ),
      }));
    },
    [commit],
  );

  const patchPerfume = useCallback(
    (id: string, patch: Partial<Pick<Perfume, "personalNotes" | "rating">>) => {
      commit((prev) => ({
        ...prev,
        perfumes: prev.perfumes.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
        ),
      }));
    },
    [commit],
  );

  const removePerfume = useCallback(
    (id: string) => {
      commit((prev) => ({ ...prev, perfumes: prev.perfumes.filter((p) => p.id !== id) }));
    },
    [commit],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        perfumes: prev.perfumes.map((p) =>
          p.id === id ? { ...p, favorite: !p.favorite, updatedAt: Date.now() } : p,
        ),
      }));
    },
    [commit],
  );

  const setNoteFilterMode = useCallback(
    (mode: NoteFilterMode) => {
      commit((prev) => ({ ...prev, settings: { ...prev.settings, noteFilterMode: mode } }));
    },
    [commit],
  );

  const exportJson = useCallback((): string => {
    return exportCatalog(data ?? createEmptyCatalog());
  }, [data]);

  const importJson = useCallback((text: string): ImportResult => {
    const result = parseImportedCatalog(text);
    if (result.ok && result.data) {
      setData(result.data);
      void storageRef.current?.save(result.data);
    }
    return result;
  }, []);

  const resetCatalog = useCallback(() => {
    commit(() => createEmptyCatalog());
  }, [commit]);

  const seedDemoData = useCallback(() => {
    commit(() => createSeedData());
  }, [commit]);

  const value = useMemo<CatalogStore | null>(() => {
    if (!data) return null;
    const notesById = new Map(data.notes.map((n) => [n.id, n]));
    const brandsById = new Map(data.brands.map((b) => [b.id, b]));
    const perfumesById = new Map(data.perfumes.map((p) => [p.id, p]));
    return {
      ready: true,
      data,
      perfumes: data.perfumes,
      notes: data.notes,
      brands: data.brands,
      getPerfume: (id) => perfumesById.get(id),
      getNote: (id) => notesById.get(id),
      getBrand: (id) => brandsById.get(id),
      ensureNote,
      ensureBrand,
      addPerfume,
      updatePerfume,
      patchPerfume,
      removePerfume,
      toggleFavorite,
      setNoteFilterMode,
      exportJson,
      importJson,
      resetCatalog,
      seedDemoData,
    };
  }, [
    data,
    ensureNote,
    ensureBrand,
    addPerfume,
    updatePerfume,
    patchPerfume,
    removePerfume,
    toggleFavorite,
    setNoteFilterMode,
    exportJson,
    importJson,
    resetCatalog,
    seedDemoData,
  ]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

/** Хук доступа к каталогу. Должен вызываться внутри <CatalogGate>. */
export function useCatalog(): CatalogStore {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog вызван до загрузки данных. Оберните UI в <CatalogGate>.");
  }
  return ctx;
}

/** Мягкая версия хука — для оболочки, которая умеет ждать. */
export function useCatalogMaybe(): CatalogStore | null {
  return useContext(CatalogContext);
}
