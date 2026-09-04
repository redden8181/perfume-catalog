import type { Brand, CatalogData, Note, Perfume } from "./types";
import { CATALOG_VERSION, DEFAULT_SETTINGS } from "./types";
import { normalizeName } from "./utils";

/**
 * Демо-данные для первого запуска.
 *
 * Тестовая матрица фильтрации:
 *   «Малина»            → Framboise Nuit, Ambre Framboise
 *   «Малина + Мускус»   → только Framboise Nuit
 *   «Мускус + Ваниль»   → Framboise Nuit, Musc Vanille
 */

function note(id: string, name: string): Note {
  return { id, name, normalized: normalizeName(name) };
}

function brand(id: string, name: string): Brand {
  return { id, name, normalized: normalizeName(name) };
}

export function createSeedData(): CatalogData {
  const notes: Note[] = [
    note("n_malina", "Малина"),
    note("n_musk", "Мускус"),
    note("n_vanil", "Ваниль"),
    note("n_ambra", "Амбра"),
    note("n_bergamot", "Бергамот"),
    note("n_roza", "Роза"),
    note("n_kozha", "Кожа"),
    note("n_derevo", "Древесные ноты"),
    note("n_tabak", "Табак"),
    note("n_ud", "Уд"),
    note("n_pion", "Пион"),
    note("n_zhasmin", "Жасмин"),
    note("n_perec", "Розовый перец"),
    note("n_shafran", "Шафран"),
    note("n_neroli", "Нероли"),
    note("n_vetiver", "Ветивер"),
    note("n_kedr", "Кедр"),
    note("n_lichi", "Личи"),
    note("n_iris", "Ирис"),
    note("n_grusha", "Груша"),
  ];

  const brands: Brand[] = [
    brand("b_velours", "Velours"),
    brand("b_maison_noir", "Maison Noir"),
    brand("b_atelier_blanc", "Atelier Blanc"),
    brand("b_sable", "Sable d'Orient"),
    brand("b_cuir", "Cuir & Co"),
    brand("b_nord", "Nord Botanica"),
    brand("b_lueur", "Lueur"),
  ];

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const perfumes: Perfume[] = [
    {
      id: "p_framboise_nuit",
      brandId: "b_velours",
      name: "Framboise Nuit",
      gender: "female",
      year: 2021,
      image: "/images/seed-framboise.jpg",
      notes: {
        top: ["n_malina", "n_bergamot"],
        heart: ["n_roza", "n_pion"],
        base: ["n_musk", "n_vanil"],
      },
      description:
        "Сочная малина, заботливо укутанная в белый мускус и тёплую ваниль. Вечерний, обволакивающий, с мягким пудровым шлейфом.",
      characteristics: "Стойкость 8+ часов. Шлейф умеренный. Сезон: осень–зима.",
      personalNotes: "Очень понравился. Купить полный флакон после теста миниатюры.",
      rating: 5,
      favorite: true,
      createdAt: now - day,
      updatedAt: now - day,
    },
    {
      id: "p_ambre_framboise",
      brandId: "b_maison_noir",
      name: "Ambre Framboise",
      gender: "unisex",
      year: 2019,
      image: "/images/seed-ambre.jpg",
      notes: {
        top: ["n_malina", "n_perec"],
        heart: ["n_zhasmin"],
        base: ["n_ambra", "n_derevo"],
      },
      description:
        "Тёмная малина на тлеющей амбре. Ягодный старт быстро уходит в смоляную, почти гурманскую глубину.",
      characteristics: "Стойкость 10 часов. Плотный шлейф. Сезон: зима.",
      personalNotes: "Напоминает нишевый люкс. Наносить мало — очень громкий.",
      rating: 4,
      favorite: false,
      createdAt: now - 2 * day,
      updatedAt: now - 2 * day,
    },
    {
      id: "p_musc_vanille",
      brandId: "b_atelier_blanc",
      name: "Musc Vanille",
      gender: "female",
      year: 2020,
      image: "/images/seed-musc.jpg",
      notes: {
        top: ["n_grusha"],
        heart: ["n_iris"],
        base: ["n_musk", "n_vanil"],
      },
      description:
        "Чистый минималистичный мускус с кремовой ванилью. Эффект «чистой кожи», идеален как повседневный.",
      characteristics: "Стойкость 6 часов. Сидит близко к коже. Сезон: круглый год.",
      personalNotes: "Хочу протестировать в жару — проверить, не удушает ли ваниль.",
      rating: 4,
      favorite: false,
      createdAt: now - 3 * day,
      updatedAt: now - 3 * day,
    },
    {
      id: "p_oud_imperial",
      brandId: "b_sable",
      name: "Oud Impérial",
      gender: "male",
      year: 2018,
      image: "/images/seed-oud.jpg",
      notes: {
        top: ["n_shafran"],
        heart: ["n_roza", "n_ud"],
        base: ["n_kozha", "n_ambra"],
      },
      description:
        "Дымный уд с шафраном и кожей. Статусный, густой, восточный — аромат кабинета и позднего вечера.",
      characteristics: "Стойкость 12 часов. Очень плотный. Сезон: глубокая осень и зима.",
      personalNotes: "Купить позже, к зиме. Напоминает Oud Wood, но темнее.",
      rating: 5,
      favorite: true,
      createdAt: now - 4 * day,
      updatedAt: now - 4 * day,
    },
    {
      id: "p_tabac_cuir",
      brandId: "b_cuir",
      name: "Tabac Cuir",
      gender: "male",
      year: 2017,
      image: null,
      notes: {
        top: ["n_tabak"],
        heart: ["n_kozha", "n_derevo"],
        base: ["n_vetiver", "n_kedr"],
      },
      description:
        "Просоленный табак и выделанная кожа. Сухой, мужской, с характером старой библиотеки.",
      characteristics: "Стойкость 9 часов. Шлейф сухой. Сезон: осень.",
      personalNotes: "Тестировать осенью на коже, не на блоттере.",
      rating: 3,
      favorite: false,
      createdAt: now - 5 * day,
      updatedAt: now - 5 * day,
    },
    {
      id: "p_bergamot_soleil",
      brandId: "b_nord",
      name: "Bergamot Soleil",
      gender: "unisex",
      year: 2022,
      image: null,
      notes: {
        top: ["n_bergamot", "n_neroli"],
        heart: ["n_zhasmin"],
        base: ["n_musk", "n_vetiver"],
      },
      description:
        "Искрящийся бергамот и нероли на белом мускусе. Лето во флаконе — лёгкий, свежий, прозрачный.",
      characteristics: "Стойкость 5 часов. Воздушный. Сезон: весна–лето.",
      personalNotes: "",
      rating: 4,
      favorite: false,
      createdAt: now - 6 * day,
      updatedAt: now - 6 * day,
    },
    {
      id: "p_rose_eternelle",
      brandId: "b_lueur",
      name: "Rose Éternelle",
      gender: "female",
      year: 2023,
      image: null,
      notes: {
        top: ["n_lichi", "n_perec"],
        heart: ["n_roza", "n_pion"],
        base: ["n_musk"],
      },
      description:
        "Современная роза с личи и пионом. Романтичная, но не наивная — с прохладной зелёной гранью.",
      characteristics: "Стойкость 7 часов. Сезон: весна.",
      personalNotes: "Подарочный вариант для мамы.",
      rating: 4,
      favorite: false,
      createdAt: now - 7 * day,
      updatedAt: now - 7 * day,
    },
  ];

  return {
    version: CATALOG_VERSION,
    perfumes,
    notes,
    brands,
    settings: { ...DEFAULT_SETTINGS },
    meta: { createdAt: now, seeded: true },
  };
}

/** Пустой каталог (после сброса). */
export function createEmptyCatalog(): CatalogData {
  return {
    version: CATALOG_VERSION,
    perfumes: [],
    notes: [],
    brands: [],
    settings: { ...DEFAULT_SETTINGS },
    meta: { createdAt: Date.now(), seeded: true },
  };
}
