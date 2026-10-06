import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle, Clipboard, Sparkles, Trash2 } from "lucide-react";
import { parsePastedText, type ParsedPerfumeData } from "../utils/textImport";
import { Sheet, GoldButton, GhostButton, toast } from "./ui";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (data: ParsedPerfumeData) => void;
}

export function TextImportSheet({ open, onClose, onApply }: Props) {
  const [text, setText] = useState("");
  const [pasteHint, setPasteHint] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    return parsePastedText(text);
  }, [text]);

  const focusTextarea = () => {
    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);
  };

  useEffect(() => {
    if (open) {
      setPasteHint("");
    }
  }, [open]);

  const handlePaste = async () => {
    // 1) Нормальный путь — Clipboard API
    try {
      if (navigator.clipboard?.readText) {
        const content = await navigator.clipboard.readText();
        if (content && content.trim()) {
          setText(content);
          setPasteHint("");
          toast("Текст вставлен и обработан");
          return;
        }
      }
    } catch {
      // на iPhone/PWA это нередко падает даже после "Разрешить"
    }

    // 2) Мягкий fallback для iPhone: переводим к полю и объясняем, что делать
    setPasteHint("На iPhone вставьте вручную: нажмите и удерживайте поле ниже → Вставить");
    toast("Автовставка недоступна — используйте ручную вставку ниже");
    focusTextarea();
  };

  const handleApply = () => {
    if (!parsed) return;
    onApply(parsed);
    setText("");
    setPasteHint("");
    onClose();
    toast("Данные применены к форме");
  };

  const handleClose = () => {
    setText("");
    setPasteHint("");
    onClose();
  };

  const noteCount = parsed
    ? parsed.notes.top.length + parsed.notes.heart.length + parsed.notes.base.length
    : 0;

  return (
    <Sheet
      open={open}
      onClose={handleClose}
      title="Импорт описания"
      footer={
        parsed ? (
          <div className="grid grid-cols-[1fr_1.4fr] gap-3">
            <GhostButton onClick={() => { setText(""); setPasteHint(""); }}>
              <Trash2 size={16} />
              Очистить
            </GhostButton>
            <GoldButton onClick={handleApply}>
              <Sparkles size={16} />
              Применить
            </GoldButton>
          </div>
        ) : (
          <GoldButton onClick={() => void handlePaste()}>
            <Clipboard size={17} />
            Вставить из буфера
          </GoldButton>
        )
      }
    >
      <div className="flex flex-col gap-5 pt-2 pb-2">
        {!parsed ? (
          <>
            <p className="text-[13px] leading-relaxed text-muted">
              Скопируйте текст со страницы аромата и нажмите кнопку ниже. Если iPhone не
              даст вставить автоматически — просто нажмите и удерживайте поле ниже → Вставить.
            </p>

            <button
              onClick={() => void handlePaste()}
              className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/30 bg-gold/5 text-goldsoft transition active:scale-[0.98]"
            >
              <Clipboard size={24} />
              <span className="text-[14px] font-medium">Нажмите, чтобы вставить текст</span>
            </button>

            {pasteHint && (
              <div className="rounded-2xl border border-gold/25 bg-gold/8 px-4 py-3 text-[13px] leading-relaxed text-goldsoft">
                {pasteHint}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted/30">
                  или вставьте вручную:
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => {
                  window.setTimeout(() => {
                    textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
                  }, 120);
                }}
                onPaste={() => setPasteHint("")}
                placeholder=""
                rows={5}
                className="w-full resize-none rounded-2xl border border-line bg-card p-4 pt-10 text-[14px] leading-relaxed text-cream outline-none focus:border-gold/40"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 rounded-2xl border border-like-border/50 bg-like-bg/20 px-4 py-3">
              <CheckCircle size={18} className="shrink-0 text-like-text" />
              <span className="text-[13px] font-medium text-like-text">
                Текст успешно проанализирован
              </span>
            </div>

            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Общая информация
              </p>
              <div className="grid gap-1.5 text-[13px] text-cream">
                <p><span className="text-muted">Название:</span> {parsed.name || "—"}</p>
                {parsed.brand && <p><span className="text-muted">Бренд:</span> {parsed.brand}</p>}
                <p><span className="text-muted">Пол:</span> {parsed.gender === "male" ? "Мужской" : parsed.gender === "female" ? "Женский" : "Унисекс"}</p>
                {parsed.year && <p><span className="text-muted">Год:</span> {parsed.year}</p>}
              </div>
            </div>

            {noteCount > 0 ? (
              <div className="rounded-2xl border border-line bg-card p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Ноты ({noteCount})
                </p>
                {(["top", "heart", "base"] as const).map((layer) => {
                  const layerNames = { top: "Верхние", heart: "Средние", base: "Базовые" };
                  const notes = parsed.notes[layer];
                  if (!notes.length) return null;
                  return (
                    <div key={layer} className="mt-2 text-[13px]">
                      <span className="text-muted">{layerNames[layer]}: </span>
                      <span className="text-cream">{notes.join(", ")}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-faint px-4 py-3 text-[13px] text-muted text-center">
                Ноты в тексте не найдены.
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-muted/70 text-center italic">
              Проверьте данные выше и нажмите «Применить».
            </p>
          </div>
        )}
      </div>
    </Sheet>
  );
}
