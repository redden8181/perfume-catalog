import { useRef, useState, type ReactNode } from "react";
import {
  Copy,
  Download,
  Eraser,
  FileJson,
  Info,
  Moon,
  Palette,
  RotateCcw,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import { catalog } from "../core/catalogStore";
import { useBrands, useCatalog } from "../hooks/useCatalog";
import { useTheme, type Theme } from "../state/ThemeContext";
import { plural } from "../core/utils";
import { copyToClipboard, exportTextFile, readFileAsText } from "../utils/download";
import {
  ConfirmSheet,
  DangerButton,
  FieldLabel,
  GhostButton,
  Segmented,
  toast,
} from "../components/ui";
import { cn } from "../utils/cn";

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gold/12 text-gold">
          {icon}
        </span>
        <h2 className="font-display text-[17px] text-cream">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function SettingsPage() {
  const { notes, perfumes } = useCatalog();
  const brands = useBrands();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge">("merge");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const sizeKb = Math.max(1, Math.round(catalog.dataSize() / 1024));

  const handleExport = async () => {
    const date = new Date().toISOString().slice(0, 10);
    const result = await exportTextFile(`aromateka-${date}.json`, catalog.exportJSON());
    toast(result === "shared" ? "Экспорт готов" : "Файл сохранён");
  };

  const handleCopy = async () => {
    await copyToClipboard(catalog.exportJSON());
    toast("JSON скопирован в буфер");
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const result = catalog.importJSON(text, importMode);
      toast(
        importMode === "replace"
          ? `Каталог восстановлен: ${result.perfumes} ${plural(result.perfumes, "аромат", "аромата", "ароматов")}`
          : `Импортировано: ${result.perfumes} ${plural(result.perfumes, "аромат", "аромата", "ароматов")}`
      );
    } catch (e) {
      toast(e instanceof Error ? e.message : "Не удалось импортировать файл");
    }
  };

  return (
    <div>
      <header className="pb-6 pt-[max(env(safe-area-inset-top),2.5rem)]">
        <h1 className="font-display text-[30px] text-cream">Настройки</h1>
        <p className="mt-1.5 text-[13px] text-muted">
          Данные хранятся локально на этом устройстве
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {/* Оформление */}
        <Section icon={<Palette size={16} />} title="Оформление">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: "dark", label: "Тёмная", icon: Moon },
                { value: "light", label: "Светлая", icon: Sun },
              ] as { value: Theme; label: string; icon: typeof Moon }[]
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex h-14 items-center justify-center gap-2 rounded-2xl border text-[14px] font-medium transition active:scale-[0.98]",
                  theme === value
                    ? "border-gold/50 bg-gold/15 text-goldsoft"
                    : "border-line bg-faint text-cream/80"
                )}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted/80">
            Выбор сохраняется на этом устройстве и применяется при каждом запуске.
          </p>
        </Section>

        {/* Статистика */}
        <Section icon={<Sparkles size={16} />} title="Коллекция">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { n: perfumes.length, label: plural(perfumes.length, "аромат", "аромата", "ароматов") },
              { n: notes.length, label: plural(notes.length, "нота", "ноты", "нот") },
              { n: brands.length, label: plural(brands.length, "бренд", "бренда", "брендов") },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl bg-faint py-3.5">
                <p className="font-display text-[22px] text-goldsoft">{s.n}</p>
                <p className="mt-0.5 text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted/70">Размер данных: ~{sizeKb} КБ</p>
        </Section>

        {/* Резервная копия */}
        <Section icon={<FileJson size={16} />} title="Резервная копия">
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Экспортируйте каталог в JSON, чтобы не потерять данные при смене устройства или
            переустановке. Импорт восстановит всё: парфюмы, ноты, заметки и рейтинги.
          </p>
          <div className="flex flex-col gap-3">
            <GhostButton onClick={() => void handleExport()}>
              <Download size={16} />
              Экспортировать JSON
            </GhostButton>
            <GhostButton onClick={() => void handleCopy()}>
              <Copy size={16} />
              Скопировать JSON
            </GhostButton>

            <div className="mt-2 border-t border-line pt-4">
              <FieldLabel>Импорт</FieldLabel>
              <Segmented
                className="mb-3"
                value={importMode}
                onChange={setImportMode}
                options={[
                  { value: "merge", label: "Объединить" },
                  { value: "replace", label: "Заменить всё" },
                ]}
              />
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  void handleImportFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <GhostButton onClick={() => fileRef.current?.click()}>
                <Upload size={16} />
                Импортировать JSON-файл
              </GhostButton>
            </div>
          </div>
        </Section>

        {/* Данные */}
        <Section icon={<RotateCcw size={16} />} title="Данные">
          <div className="flex flex-col gap-3">
            <GhostButton
              onClick={() => {
                const removed = catalog.pruneUnusedNotes();
                toast(
                  removed > 0
                    ? `Удалено неиспользуемых нот: ${removed}`
                    : "Все ноты используются"
                );
              }}
            >
              <Eraser size={16} />
              Удалить неиспользуемые ноты
            </GhostButton>
            <GhostButton onClick={() => setConfirmReset(true)}>
              <RotateCcw size={16} />
              Сбросить к демо-данным
            </GhostButton>
            <DangerButton onClick={() => setConfirmClear(true)}>
              <Trash2 size={16} />
              Удалить все данные
            </DangerButton>
          </div>
        </Section>

        {/* О приложении */}
        <Section icon={<Info size={16} />} title="О приложении">
          <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-muted">
            <div className="flex items-start gap-2.5">
              <Smartphone size={16} className="mt-0.5 shrink-0 text-gold" />
              <p>
                На iPhone: откройте сайт в Safari → «Поделиться» → «На экран “Домой”».
                Приложение будет работать офлайн и обновляться автоматически.
              </p>
            </div>
            <p>Ароматека · версия 1.1.0 · личный каталог парфюмерии</p>
          </div>
        </Section>
      </div>

      <ConfirmSheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          catalog.resetToSeed();
          toast("Загружены демо-данные");
        }}
        title="Сбросить к демо?"
        text="Текущий каталог будет заменён демонстрационными данными. Экспортируйте JSON заранее, если хотите сохранить свои данные."
        confirmLabel="Сбросить"
      />
      <ConfirmSheet
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          catalog.clearAll();
          toast("Все данные удалены");
        }}
        title="Удалить всё?"
        text="Будут удалены все парфюмы, ноты и заметки без возможности восстановления. Экспортируйте JSON заранее."
        confirmLabel="Удалить всё"
      />
    </div>
  );
}
