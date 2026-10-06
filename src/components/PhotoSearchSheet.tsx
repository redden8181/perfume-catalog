import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Loader2, Search, Sparkles } from "lucide-react";
import {
  downloadSuggestionImage,
  searchPerfumePhotos,
  type PhotoSuggestion,
} from "../utils/photoSearch";
import { GhostButton, GoldButton, Sheet, toast } from "./ui";

interface Props {
  open: boolean;
  onClose: () => void;
  initialQuery: string;
  onSelect: (image: string) => void;
}

export function PhotoSearchSheet({ open, onClose, initialQuery, onSelect }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [results, setResults] = useState<PhotoSuggestion[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setResults([]);
      setError("");
    }
  }, [open, initialQuery]);

  // Как только шторка открылась с готовым запросом — сразу ищем фото,
  // чтобы приложение действительно «предлагало» варианты, а не ждало лишний клик.
  useEffect(() => {
    if (!open || initialQuery.trim().length < 3) return;
    void handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQuery]);

  const canSearch = query.trim().length >= 3;
  const titleHint = useMemo(() => {
    if (!initialQuery.trim()) return "Заполните сначала бренд и название";
    return `Запрос: ${initialQuery}`;
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!canSearch) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const items = await searchPerfumePhotos(query.trim());
      setResults(items);
      if (items.length === 0) setError("Ничего не найдено. Попробуйте короче запрос.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось выполнить поиск");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (item: PhotoSuggestion) => {
    setDownloadingId(item.id);
    try {
      const image = await downloadSuggestionImage(item.imageUrl);
      onSelect(image);
      toast("Фото добавлено");
      onClose();
    } catch {
      toast("Не удалось загрузить фото");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Подобрать промо-фото"
      footer={
        <div className="grid grid-cols-[1fr_1.4fr] gap-3">
          <GhostButton onClick={onClose}>Закрыть</GhostButton>
          <GoldButton onClick={() => void handleSearch()} disabled={!canSearch || loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Найти фото
          </GoldButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        <p className="text-[13px] leading-relaxed text-muted">
          Ищем каталожные фото флаконов по названию и бренду. Обычно это чистые
          карточные изображения, похожие на Fragrantica.
        </p>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            {titleHint}
          </p>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-card px-4">
            <Search size={16} className="shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Например: Azman Majnoon"
              className="h-[52px] w-full bg-transparent text-[15px] text-cream outline-none placeholder:text-muted/50"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
            {error}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pb-2">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => void handleSelect(item)}
                disabled={downloadingId !== null}
                className="overflow-hidden rounded-2xl border border-line bg-card text-left transition active:scale-[0.98] disabled:opacity-60"
              >
                <div className="aspect-[3/4] overflow-hidden bg-faint">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-gold">
                    {item.brand || "—"}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-cream">
                    {item.name}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {item.year ?? "год неизвестен"}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-medium text-goldsoft">
                    {downloadingId === item.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Загружаем…
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        Выбрать
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-faint px-5 py-8 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-card text-muted">
              <ImageIcon size={20} />
            </div>
            <p className="mt-3 text-[13px] text-muted">
              Нажмите «Найти фото», чтобы получить несколько красивых промо-вариантов.
            </p>
          </div>
        )}
      </div>
    </Sheet>
  );
}
