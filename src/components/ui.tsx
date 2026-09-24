import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Star, X } from "lucide-react";
import { cn } from "../utils/cn";

/* ============================== Тосты ============================== */

interface ToastMsg {
  id: number;
  text: string;
}

type ToastListener = (t: ToastMsg) => void;
const toastListeners = new Set<ToastListener>();
let toastId = 0;

/** Показать короткое уведомление. Работает из любого места (в т.ч. из data-слоя). */
export function toast(text: string) {
  const msg = { id: ++toastId, text };
  toastListeners.forEach((l) => l(msg));
}

export function ToastHost() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  useEffect(() => {
    const listener: ToastListener = (t) => {
      setItems((arr) => [...arr.slice(-2), t]);
      window.setTimeout(() => {
        setItems((arr) => arr.filter((x) => x.id !== t.id));
      }, 2600);
    };
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[80] flex flex-col items-center gap-2 px-6">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="max-w-full rounded-full border border-gold/25 bg-lift/95 px-5 py-2.5 text-center text-[13px] font-medium text-cream shadow-2xl shadow-black/30 backdrop-blur-md"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ============================== Bottom Sheet ============================== */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-md flex-col rounded-t-[28px] border-t border-line bg-coal shadow-2xl shadow-black/30"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="relative flex items-center justify-center px-5 pb-2 pt-3">
              <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-faint-strong" />
              <h2 className="pt-2 font-display text-lg text-cream">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Закрыть"
                className="absolute right-4 top-1/2 mt-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-faint text-muted transition active:bg-faint-strong"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
            {footer && (
              <div className="border-t border-line bg-coal px-5 pb-4 pt-3">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  text,
  confirmLabel = "Удалить",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  text: string;
  confirmLabel?: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <p className="pt-1 text-[14px] leading-relaxed text-muted">{text}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <GhostButton onClick={onClose}>Отмена</GhostButton>
        <DangerButton
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </DangerButton>
      </div>
    </Sheet>
  );
}

/* ============================== Кнопки ============================== */

export function GoldButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gold text-[15px] font-semibold text-ongold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
        className
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-line bg-faint text-[15px] font-medium text-cream transition active:scale-[0.98]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 text-[15px] font-semibold text-danger transition active:scale-[0.98]",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ============================== Рейтинг ============================== */

export function StarRating({
  value,
  onChange,
  size = 18,
  className,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  className?: string;
}) {
  const interactive = typeof onChange === "function";
  return (
    <div className={cn("flex items-center", interactive ? "-mx-1.5" : "gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        const star = (
          <Star
            size={size}
            strokeWidth={1.5}
            className={filled ? "fill-gold text-gold" : "fill-transparent text-muted/50"}
          />
        );
        return interactive ? (
          <button
            key={i}
            type="button"
            aria-label={`Оценка ${i}`}
            onClick={() => onChange(value === i ? 0 : i)}
            className="grid h-10 w-10 place-items-center transition active:scale-90"
          >
            {star}
          </button>
        ) : (
          <span key={i} className="grid place-items-center">
            {star}
          </span>
        );
      })}
    </div>
  );
}

/* ============================== Чипсы ============================== */

export function Chip({
  label,
  selected,
  onClick,
  onRemove,
  className,
  image,
  variant = "neutral",
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  image?: string | null;
  variant?: "neutral" | "like" | "dislike";
}) {
  const isLike = variant === "like";
  const isDislike = variant === "dislike";

  let colors = selected
    ? "border-gold/50 bg-gold/15 text-goldsoft"
    : "border-line bg-faint text-cream/80";
  
  if (isLike) {
    colors = selected
      ? "border-like-border bg-like-bg text-like-text font-semibold"
      : "border-like-border/60 bg-like-bg/30 text-like-text/90";
  } else if (isDislike) {
    colors = selected
      ? "border-dislike-border bg-dislike-bg text-dislike-text font-semibold"
      : "border-dislike-border/60 bg-dislike-bg/30 text-dislike-text/90";
  }

  const imgEl = image ? (
    <img src={image} alt="" className="h-6 w-6 rounded-full object-cover -ml-2 mr-1.5 opacity-90 border border-line" />
  ) : null;

  if (onRemove) {
    let removeBtnColors = "text-goldsoft/80 active:bg-gold/20";
    if (isLike) removeBtnColors = "text-like-text/80 active:bg-like-border";
    if (isDislike) removeBtnColors = "text-dislike-text/80 active:bg-dislike-border";

    return (
      <span
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-full border pl-3.5 pr-1 text-[13px] font-medium",
          colors,
          image && "pl-2.5",
          className
        )}
      >
        {imgEl}
        {label}
        <button
          onClick={onRemove}
          aria-label={`Убрать ${label}`}
          className={cn("grid h-7 w-7 place-items-center rounded-full transition", removeBtnColors)}
        >
          <X size={15} />
        </button>
      </span>
    );
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium transition active:scale-95",
        colors,
        image && "pl-2.5",
        className
      )}
    >
      {imgEl}
      {label}
    </button>
  );
}

/* ============================== Свитч ============================== */

export function Switch({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between py-1"
    >
      <span className="flex items-center gap-2.5 text-[14px] text-cream">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "flex h-7 w-12 items-center rounded-full p-1 transition-colors duration-200",
          checked ? "justify-end bg-gold" : "justify-start bg-faint-strong"
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full shadow transition-colors",
            checked ? "bg-ongold" : "bg-cream/80"
          )}
        />
      </span>
    </button>
  );
}

/* ============================== Сегментированный контрол ============================== */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex rounded-full border border-line bg-card p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex h-8 flex-1 items-center justify-center rounded-full px-3 text-[12px] font-medium transition",
            value === o.value ? "bg-gold text-ongold" : "text-muted"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================== Прочее ============================== */

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
      {children}
    </p>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center px-8 pb-16 pt-14 text-center"
    >
      <div className="grid h-16 w-16 place-items-center rounded-full border border-gold/20 bg-gold/8 text-gold">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-xl text-cream">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-6 w-full max-w-[240px]">{action}</div>}
    </motion.div>
  );
}

export function CheckMark({ className }: { className?: string }) {
  return <Check size={16} strokeWidth={2.5} className={className} />;
}
