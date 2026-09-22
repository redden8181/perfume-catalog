import { NavLink } from "react-router-dom";
import { Heart, LibraryBig, Plus, Settings2 } from "lucide-react";
import { cn } from "../utils/cn";

const itemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-medium transition",
    isActive ? "text-gold" : "text-muted"
  );

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-ink/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex w-full max-w-md items-end px-4">
        <NavLink to="/" end className={itemClass}>
          <LibraryBig size={22} strokeWidth={1.8} />
          Каталог
        </NavLink>
        <NavLink to="/favorites" className={itemClass}>
          <Heart size={22} strokeWidth={1.8} />
          Избранное
        </NavLink>
        <div className="flex flex-1 justify-center">
          <NavLink
            to="/add"
            aria-label="Добавить парфюм"
            className={({ isActive }) =>
              cn(
                "-mt-6 grid h-14 w-14 place-items-center rounded-full border-4 border-ink text-ongold shadow-[0_10px_30px_rgba(163,124,60,0.4)] transition active:scale-95",
                isActive ? "bg-goldsoft" : "bg-gold"
              )
            }
          >
            <Plus size={26} strokeWidth={2.4} />
          </NavLink>
        </div>
        <NavLink to="/settings" className={itemClass}>
          <Settings2 size={22} strokeWidth={1.8} />
          Настройки
        </NavLink>
      </div>
    </nav>
  );
}
