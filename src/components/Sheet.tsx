"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/core/utils";
import { GhostButton } from "./ui";

/**
 * Универсальная шторка: на телефоне — снизу, на десктопе — по центру.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/65 backdrop-blur-[3px]"
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col overflow-hidden",
          "rounded-t-[28px] border border-b-0 border-line bg-ink-2 shadow-sheet",
          "animate-sheet-up",
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2",
          "sm:rounded-[28px] sm:border-b sm:animate-pop-in sm:max-h-[85dvh]",
        )}
      >
        <div className="relative flex items-center justify-center px-5 pb-2 pt-3">
          <span aria-hidden className="absolute top-2 h-1 w-10 rounded-full bg-line-2 sm:hidden" />
          {title && (
            <h2 className="pt-2 font-display text-xl font-semibold text-ivory sm:pt-1">{title}</h2>
          )}
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors active:bg-surface-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
        {footer && (
          <div className="border-t border-line bg-ink-2/95 px-5 py-4 safe-bottom">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  text?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      {text && <p className="pb-2 text-sm leading-relaxed text-muted">{text}</p>}
      <div className="flex flex-col gap-2 pt-3">
        <button
          onClick={onConfirm}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-wine px-6 text-[15px] font-bold text-[#20090c] transition-all active:scale-[0.98]"
        >
          {confirmLabel}
        </button>
        <GhostButton onClick={onCancel}>{cancelLabel}</GhostButton>
      </div>
    </Sheet>
  );
}
