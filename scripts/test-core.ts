/**
 * Функциональные проверки ядра каталога (без браузера).
 * Запуск: node --experimental-strip-types scripts/test-core.ts
 */
import { createSeedData } from "../src/core/seed.ts";
import {
  applyFilters,
  buildFilterContext,
  EMPTY_FILTERS,
  matchesNotes,
} from "../src/core/filter.ts";
import { exportCatalog, parseImportedCatalog } from "../src/core/import-export.ts";
import { normalizeName } from "../src/core/utils.ts";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`✓ ${name}`);
  } else {
    failures++;
    console.error(`✗ ${name}\n   ожидалось: ${e}\n   получено:  ${a}`);
  }
}

const data = createSeedData();
const ctx = buildFilterContext(data.notes, data.brands);
const ids = data.perfumes.map((p) => p.id);
const N = { malina: "n_malina", musk: "n_musk", vanil: "n_vanil", ambra: "n_ambra" };

const run = (noteIds: string[], mode: "all" | "any") =>
  applyFilters(data.perfumes, { ...EMPTY_FILTERS, noteIds, noteMode: mode }, ctx).map((p) => p.id);

// --- Сценарии из ТЗ ---
check("«Малина» → P1,P2", run([N.malina], "all").sort(), ["p_ambre_framboise", "p_framboise_nuit"].sort());
check("«Малина+Мускус» (ВСЕ) → только P1", run([N.malina, N.musk], "all"), ["p_framboise_nuit"]);
check("«Мускус+Ваниль» (ВСЕ) → P1,P3", run([N.musk, N.vanil], "all").sort(), ["p_framboise_nuit", "p_musc_vanille"].sort());
check("«Малина+Мускус» (ЛЮБАЯ) → шире", run([N.malina, N.musk], "any").length, 5);
check("Пустой выбор → все", run([], "all").sort(), ids.sort());
check("Парфюм без малины не проходит фильтр «Малина»", matchesNotes(data.perfumes.find(p => p.id === "p_musc_vanille")!, [N.malina], "all"), false);

// --- Поиск ---
const search = (query: string) =>
  applyFilters(data.perfumes, { ...EMPTY_FILTERS, query }, ctx).map((p) => p.id);
check("Поиск по ноте «малина»", search("малина").sort(), ["p_ambre_framboise", "p_framboise_nuit"].sort());
check("Поиск по бренду «velours»", search("velours"), ["p_framboise_nuit"]);
check("Поиск по названию «oud”", search("oud"), ["p_oud_imperial"]);
check("Поиск без учёта регистра «МАЛИНА»", search("МАЛИНА").length, 2);

// --- Фильтры ---
check(
  "Фильтр по полу (мужские)",
  applyFilters(data.perfumes, { ...EMPTY_FILTERS, genders: ["male"] }, ctx).map((p) => p.id).sort(),
  ["p_oud_imperial", "p_tabac_cuir"].sort(),
);
check(
  "Минимальный рейтинг 5",
  applyFilters(data.perfumes, { ...EMPTY_FILTERS, minRating: 5 }, ctx).map((p) => p.id).sort(),
  ["p_framboise_nuit", "p_oud_imperial"].sort(),
);
check(
  "Только избранное",
  applyFilters(data.perfumes, { ...EMPTY_FILTERS, favoritesOnly: true }, ctx).map((p) => p.id).sort(),
  ["p_framboise_nuit", "p_oud_imperial"].sort(),
);
check(
  "Год от 2020",
  applyFilters(data.perfumes, { ...EMPTY_FILTERS, yearFrom: 2020 }, ctx).length,
  4,
);

// --- Импорт/экспорт ---
const exported = exportCatalog(data);
const roundTrip = parseImportedCatalog(exported);
check("Экспорт → импорт: ок", roundTrip.ok, true);
check("Экспорт → импорт: число ароматов", roundTrip.counts?.perfumes, data.perfumes.length);
check("Экспорт → импорт: число нот", roundTrip.counts?.notes, data.notes.length);

// Дедупликация «Малина» + «малина» при импорте
const dupJson = JSON.stringify({
  perfumes: [
    { name: "Тест", brandId: "b1", notes: { top: ["n1", "n2"], heart: [], base: [] } },
  ],
  notes: [
    { id: "n1", name: "Малина" },
    { id: "n2", name: "малина" },
  ],
  brands: [{ id: "b1", name: "Тест Бренд" }],
});
const dup = parseImportedCatalog(dupJson);
check("Дедупликация «Малина»/«малина» при импорте", dup.data?.notes.length, 1);
check(
  "Обе ссылки ведут на одну ноту",
  new Set(dup.data?.perfumes[0].notes.top ?? []).size,
  1,
);
check("Некорректный JSON отклоняется", parseImportedCatalog("{oops").ok, false);
check("JSON без perfumes отклоняется", parseImportedCatalog("{}").ok, false);

// --- Нормализация имён ---
check("normalizeName склеивает пробелы и регистр", normalizeName("  МаЛина  Кустовая "), "малина кустовая");

console.log(failures === 0 ? "\nВСЕ ПРОВЕРКИ ПРОЙДЕНЫ" : `\nПРОВАЛОВ: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
