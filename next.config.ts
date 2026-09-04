import type { NextConfig } from "next";

/**
 * Два режима сборки:
 *
 * 1. Обычный (локальная разработка, превью, self-hosted):
 *      npm run build && npm start
 *
 * 2. Статический экспорт для GitHub Pages (выставляется в GitHub Actions):
 *      STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/repo-name npm run build
 *    Результат — статические файлы в каталоге `out/`.
 *
 * NEXT_PUBLIC_BASE_PATH нужен, когда Pages раздаёт сайт из подкаталога
 * (https://user.github.io/repo-name/). Для user.github.io оставьте пустым.
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: basePath || undefined,
  images: {
    // В статическом экспорте оптимизация изображений недоступна —
    // каталог в любом случае использует локальные/сжатые изображения.
    unoptimized: true,
  },
};

export default nextConfig;
