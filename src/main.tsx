import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

/**
 * Service Worker для офлайн-работы и мгновенного запуска.
 * Регистрируем по относительному пути — приложение работает
 * и в корне домена, и в подпапке GitHub Pages (user.github.io/repo/).
 * Стратегия SW (public/sw.js): network-first для HTML → после каждого
 * деплоя приложение само обновляется при следующем открытии.
 */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {
      /* офлайн-режим недоступен, но приложение работает */
    });
  });
}
