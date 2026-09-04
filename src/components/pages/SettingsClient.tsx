"use client";

import {
  Download,
  Eraser,
  FlaskConical,
  Heart,
  Info,
  SprayCan,
  Tags,
  Building2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useCatalog } from "@/core/catalog-store";
import type { ImportResult } from "@/core/import-export";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/Sheet";
import { GhostButton, Overline } from "@/components/ui";

type PendingAction = "import" | "seed" | "reset" | null;

export function SettingsClient() {
  const catalog = useCatalog();
  const { perfumes, notes, brands } = catalog;
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [importText, setImportText] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const favoritesCount = perfumes.filter((p) => p.favorite).length;

  const doExport = () => {
    const json = catalog.exportJson();
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `aromateka-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ ok: true, text: "Файл экспортирован. Храните его как резервную копию каталога." });
  };

  const onFileChosen = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    // Сначала проверяем содержимое, потом просим подтверждение замены.
    setImportText(text);
    setPending("import");
  };

  const applyImport = () => {
    if (!importText) return;
    const result: ImportResult = catalog.importJson(importText);
    if (result.ok && result.counts) {
      setMessage({
        ok: true,
        text: `Каталог восстановлен: ${result.counts.perfumes} ароматов, ${result.counts.notes} нот, ${result.counts.brands} брендов.`,
      });
    } else {
      setMessage({ ok: false, text: result.error ?? "Не удалось импортировать файл." });
    }
    setImportText(null);
  };

  const confirmAction = () => {
    if (pending === "import") applyImport();
    if (pending === "seed") {
      catalog.seedDemoData();
      setMessage({ ok: true, text: "Демонстрационные данные загружены (текущий каталог заменён)." });
    }
    if (pending === "reset") {
      catalog.resetCatalog();
      setMessage({ ok: true, text: "Каталог очищен." });
    }
    setPending(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Ещё" subtitle="Данные, резервные копии и информация о приложении" />

      {/* Статистика */}
      <section>
        <Overline className="mb-3">Коллекция</Overline>
        <div className="grid grid-cols-4 gap-2.5">
          <Stat icon={SprayCan} value={perfumes.length} label="ароматы" />
          <Stat icon={Tags} value={notes.length} label="ноты" />
          <Stat icon={Building2} value={brands.length} label="бренды" />
          <Stat icon={Heart} value={favoritesCount} label="избранное" />
        </div>
      </section>

      {/* Резервная копия */}
      <section className="space-y-3">
        <Overline>Резервная копия</Overline>
        <p className="text-sm leading-relaxed text-muted">
          Каталог хранится локально на этом устройстве. Экспортируйте JSON, чтобы перенести
          коллекцию на другой телефон или не потерять её при обновлении.
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            onClick={doExport}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-2 to-gold px-6 text-[15px] font-bold text-[#1c1610] transition-transform active:scale-[0.98]"
          >
            <Download className="h-5 w-5" />
            Экспорт JSON
          </button>
          <GhostButton className="flex-1" onClick={() => fileRef.current?.click()}>
            <Upload className="h-5 w-5 text-gold" />
            Импорт JSON
          </GhostButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void onFileChosen(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {message && (
          <p
            className={
              "rounded-2xl border px-4 py-3 text-sm leading-relaxed animate-fade-in " +
              (message.ok
                ? "border-gold/40 bg-gold/10 text-gold-2"
                : "border-wine/50 bg-wine/10 text-wine")
            }
          >
            {message.text}
          </p>
        )}
      </section>

      {/* Данные */}
      <section className="space-y-3">
        <Overline>Данные каталога</Overline>
        <div className="space-y-2.5 rounded-3xl border border-line bg-surface/50 p-4">
          <button
            onClick={() => setPending("seed")}
            className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-2 text-left text-[15px] font-medium text-ivory transition-colors active:bg-surface-2"
          >
            <FlaskConical className="h-5 w-5 shrink-0 text-gold/80" />
            Загрузить демонстрационные данные
          </button>
          <button
            onClick={() => setPending("reset")}
            className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-2 text-left text-[15px] font-medium text-wine transition-colors active:bg-wine/10"
          >
            <Eraser className="h-5 w-5 shrink-0" />
            Очистить каталог полностью
          </button>
        </div>
      </section>

      {/* О приложении */}
      <section className="space-y-3 pb-6">
        <Overline>О приложении</Overline>
        <div className="space-y-3 rounded-3xl border border-line bg-surface/50 p-5 text-sm leading-relaxed text-muted">
          <p className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold/80" />
            <span>
              Ароматека — личный каталог парфюмерии. Данные хранятся только на вашем
              устройстве (localStorage) и никуда не отправляются. Хранилище отделено
              от интерфейса, поэтому в будущем его можно заменить на серверную базу данных.
            </span>
          </p>
          <p>
            Версия 1.0 · Тёмная тема. Светлая тема и облачная синхронизация — в планах.
          </p>
        </div>
      </section>

      <ConfirmDialog
        open={pending !== null}
        title={
          pending === "import"
            ? "Импортировать каталог?"
            : pending === "seed"
              ? "Загрузить демо-данные?"
              : "Очистить каталог?"
        }
        text={
          pending === "import"
            ? "Импорт полностью ЗАМЕНИТ текущий каталог содержимым файла. Советуем сначала сделать экспорт."
            : pending === "seed"
              ? "Текущий каталог будет заменён демонстрационными данными."
              : "Все ароматы, ноты и бренды будут удалены безвозвратно."
        }
        confirmLabel={
          pending === "import" ? "Заменить каталог" : pending === "seed" ? "Загрузить" : "Очистить"
        }
        onCancel={() => {
          setPending(null);
          setImportText(null);
        }}
        onConfirm={confirmAction}
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof SprayCan;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface/60 px-2 py-4">
      <Icon className="h-5 w-5 text-gold/80" />
      <span className="font-display text-2xl font-semibold text-ivory">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
        {label}
      </span>
    </div>
  );
}
