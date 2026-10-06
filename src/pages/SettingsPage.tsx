import { useRef, useState, type ReactNode } from "react";
import {
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileJson,
  Info,
  KeyRound,
  Moon,
  Palette,
  ScrollText,
  Smartphone,
  Sparkles,
  Sun,
  Upload,
} from "lucide-react";
import { catalog } from "../core/catalogStore";
import { useBrands, useCatalog } from "../hooks/useCatalog";
import { useTheme, type Theme } from "../state/ThemeContext";
import { plural } from "../core/utils";
import { copyToClipboard, exportTextFile, readFileAsText } from "../utils/download";
import { getParseApiKey, setParseApiKey } from "../utils/integrations";
import { FieldLabel, GhostButton, GoldButton, Segmented, Sheet, toast } from "../components/ui";
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
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [parseKey, setParseKey] = useState(() => getParseApiKey());

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

        {/* Интеграции */}
        <Section icon={<KeyRound size={16} />} title="Интеграции">
          <p className="mb-4 text-[13px] leading-relaxed text-muted">
            Для поиска красивых промо-фото флаконов нужен бесплатный ключ. Он хранится
            только на вашем телефоне.
          </p>

          <button
            onClick={() => setInstructionsOpen(true)}
            className="mb-4 flex w-full items-center justify-between rounded-2xl border border-gold/20 bg-gold/5 p-4 text-left transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gold/10 text-gold">
                <Info size={16} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-goldsoft">Как получить ключ?</p>
                <p className="text-[11px] text-muted">Пошаговая инструкция на русском</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gold/40" />
          </button>

          <FieldLabel>Parse API Key</FieldLabel>
          <input
            value={parseKey}
            onChange={(e) => setParseKey(e.target.value)}
            placeholder="Вставьте ваш X-API-Key"
            className="h-[52px] w-full rounded-2xl border border-line bg-card px-4 text-[15px] text-cream outline-none placeholder:text-muted/50 focus:border-gold/40"
          />
          <div className="mt-4 flex gap-2">
            <GoldButton
              onClick={() => {
                setParseApiKey(parseKey);
                toast(parseKey.trim() ? "API key сохранён" : "API key очищен");
              }}
              className="h-11 flex-1"
            >
              Сохранить ключ
            </GoldButton>
          </div>
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
            <p>Ароматека · версия 1.6.2 · личный каталог парфюмерии</p>
            <GhostButton onClick={() => setChangelogOpen(true)} className="mt-2 h-11 border-line bg-card">
              <ScrollText size={16} />
              История версий
            </GhostButton>
          </div>
        </Section>
      </div>

      <Sheet open={instructionsOpen} onClose={() => setInstructionsOpen(false)} title="Как получить API ключ?">
        <div className="flex flex-col gap-5 pt-2 pb-6 px-1">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-gold text-[13px] font-bold">1</div>
              <div className="space-y-2">
                <p className="text-[14px] text-cream">Откройте сайт <b>parse.bot</b></p>
                <a 
                  href="https://parse.bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold/10 px-4 py-2 text-[13px] font-medium text-goldsoft transition active:scale-95"
                >
                  <ExternalLink size={14} />
                  Перейти на parse.bot
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-gold text-[13px] font-bold">2</div>
              <p className="text-[14px] text-cream leading-relaxed">
                Нажмите синюю кнопку <b>"Sign Up"</b> (Регистрация) в верхнем правом углу. 
                Можно быстро войти через Google.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-gold text-[13px] font-bold">3</div>
              <p className="text-[14px] text-cream leading-relaxed">
                После входа вы сразу попадете в <b>Dashboard</b> (Панель управления).
              </p>
            </div>

            <div className="flex gap-4">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-gold text-[13px] font-bold">4</div>
              <p className="text-[14px] text-cream leading-relaxed">
                Найдите блок с заголовком <b>"Your API Key"</b> или вкладку <b>"API Keys"</b>. 
                Там будет длинная строка символов.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/20 text-gold text-[13px] font-bold">5</div>
              <p className="text-[14px] text-cream leading-relaxed">
                Нажмите на иконку <b>Copy</b> (квадратики) рядом с ключом.
              </p>
            </div>

            <div className="flex gap-4 border-t border-line pt-4">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold text-ongold text-[13px] font-bold">6</div>
              <p className="text-[14px] text-cream leading-relaxed">
                Вернитесь в <b>Ароматеку</b> и вставьте ключ в поле <b>Parse API Key</b> выше. 
                Не забудьте нажать кнопку <b>"Сохранить ключ"</b>.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-4">
            <p className="text-[12px] leading-relaxed text-muted/80">
              <b>Важно:</b> Бесплатного тарифа на parse.bot (200 запросов в месяц) с запасом хватает 
              для личной коллекции. Платить ничего не нужно.
            </p>
          </div>
          
          <GoldButton onClick={() => setInstructionsOpen(false)}>Понятно</GoldButton>
        </div>
      </Sheet>

      <Sheet open={changelogOpen} onClose={() => setChangelogOpen(false)} title="История версий">
        <div className="flex flex-col gap-6 pt-2 pb-6 px-1">
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.6.2</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Добавлена пошаговая русская инструкция по получению Parse API Key.</li>
              <li>Улучшен интерфейс раздела интеграций.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.6.1</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Поиск промо-фото теперь предлагается заметно и явно.</li>
              <li>После импорта текста приложение само предлагает подобрать фото.</li>
              <li>Шторка поиска фото запускает поиск автоматически при открытии.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.6.0</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Добавлен поиск промо-фото флаконов по названию и бренду.</li>
              <li>Можно выбрать один из нескольких каталожных вариантов.</li>
              <li>Добавлен раздел «Интеграции» для бесплатного Parse API key.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.5.2</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Добавлена кнопка «Вставить из буфера» в шторку импорта — заполнение в один клик.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.5.1</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Исправлено распознавание русских нот в описании парфюма.</li>
              <li>Улучшено разделение Бренда и Названия для русскоязычных текстов.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.5.0</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Полностью переработан механизм импорта (в связи с блокировками сайтов).</li>
              <li>Теперь используется "Умная вставка текста": скопируйте описание со страницы аромата (с нотами), и приложение само вытащит из него ноты, год, пол и название.</li>
              <li>Это работает моментально, офлайн и не блокируется защитой сайтов.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.4.0</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Экспериментальный импорт парфюма по ссылке.</li>
              <li>Словарь перевода нот с английского на русский (90+ нот).</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.3.0</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Шторка выбора нот теперь не уходит под клавиатуру на iPhone.</li>
              <li>Поиск в шторке нот сбрасывается при каждом открытии.</li>
              <li>После выбора ноты строка поиска очищается автоматически.</li>
              <li>Добавлен крестик для мгновенной очистки строки поиска.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.2.0</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Добавлен раздел «Ноты» с миниатюрами и поиском.</li>
              <li>Оценка нот (Нравится / Не нравится) с цветовым выделением везде в приложении.</li>
              <li>Увеличены миниатюры нот в карточках ароматов для удобства.</li>
              <li>Удалены кнопки полного сброса базы данных для безопасности.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.1.0</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Добавлена светлая тема (установлена по умолчанию).</li>
              <li>Добавлен раздел «Оформление» в настройках.</li>
              <li>Обновлена иконка приложения.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-goldsoft">Версия 1.0.0</h3>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-cream/85">
              <li>Первый релиз: личный офлайн-каталог парфюмерии.</li>
              <li>Поиск и продвинутая фильтрация ароматов по нотам.</li>
              <li>Резервное копирование и экспорт базы в JSON.</li>
            </ul>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
