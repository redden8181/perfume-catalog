import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./state/ThemeContext";
import { FilterProvider } from "./state/FilterContext";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { PerfumeDetailPage } from "./pages/PerfumeDetailPage";
import { PerfumeFormPage } from "./pages/PerfumeFormPage";
import { NotesPage } from "./pages/NotesPage";
import { SettingsPage } from "./pages/SettingsPage";

/**
 * HashRouter — единственный надёжный роутинг для статического хостинга
 * (GitHub Pages): не требует серверных редиректов и работает офлайн.
 */
export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <FilterProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="add" element={<PerfumeFormPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="edit/:id" element={<PerfumeFormPage />} />
              <Route path="perfume/:id" element={<PerfumeDetailPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </FilterProvider>
      </HashRouter>
    </ThemeProvider>
  );
}
