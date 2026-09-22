import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { ToastHost } from "./ui";

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      {/* Атмосферный фон (цвета зависят от темы, см. index.css) */}
      <div className="ambient-bg" aria-hidden="true" />

      <div className="mx-auto w-full max-w-md px-4 pb-32">
        <Outlet />
      </div>

      <BottomNav />
      <ToastHost />
    </div>
  );
}
