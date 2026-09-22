import type { CatalogSnapshot, Note, NoteLayer, Perfume } from "./types";

/**
 * Демонстрационный каталог. Создаётся только при первом запуске
 * (или через «Сбросить к демо-данным» в настройках).
 *
 * Проверка ТЗ:
 *  — нота «Малина»          → Framboise Musc + Rouge Ambre
 *  — «Малина» + «Мускус»    → только Framboise Musc
 *  — «Мускус» + «Ваниль»    → Framboise Musc + Musc Vanille
 */

const NOTE_NAMES = [
  "Малина",
  "Мускус",
  "Ваниль",
  "Бергамот",
  "Роза",
  "Амбра",
  "Кожа",
  "Уд",
  "Табак",
  "Древесные ноты",
  "Пачули",
  "Сандал",
  "Ирис",
  "Нероли",
] as const;

type SeedNoteName = (typeof NOTE_NAMES)[number];

interface SeedPerfume {
  id: string;
  brand: string;
  name: string;
  gender: Perfume["gender"];
  year: number;
  image: string;
  notes: Record<NoteLayer, SeedNoteName[]>;
  description: string;
  characteristics: string;
  personalNotes: string;
  rating: number;
  favorite: boolean;
}

const SEED_PERFUMES: SeedPerfume[] = [
  {
    id: "p-framboise-musc",
    brand: "Maison Noir",
    name: "Framboise Musc",
    gender: "female",
    year: 2019,
    image: "images/seed/p1.jpg",
    notes: {
      top: ["Малина", "Бергамот"],
      heart: ["Роза", "Мускус"],
      base: ["Ваниль", "Мускус"],
    },
    description:
      "Сочная малина в облаке пудрового мускуса и тёплой ванили. Яркий старт сменяется нежным, почти кожаным теплом — аромат-объятие для прохладных вечеров.",
    characteristics: "Стойкость 8+ часов · плотный шлейф · осень/зима, вечер",
    personalNotes: "Очень понравился. Брать дозаправку во флакон 10 мл.",
    rating: 5,
    favorite: true,
  },
  {
    id: "p-rouge-ambre",
    brand: "Atelier Ambre",
    name: "Rouge Ambre",
    gender: "unisex",
    year: 2021,
    image: "images/seed/p2.jpg",
    notes: {
      top: ["Малина"],
      heart: ["Амбра", "Роза"],
      base: ["Амбра", "Пачули"],
    },
    description:
      "Тёмная малина, растворённая в смолистой амбре. Роза придаёт бархат, пачули — глубину. Звучит дорого и немного опасно.",
    characteristics: "Стойкость 10 часов · средний шлейф · вечер, особые случаи",
    personalNotes: "Купить позже — после прохладных тестов на коже.",
    rating: 4,
    favorite: false,
  },
  {
    id: "p-musc-vanille",
    brand: "Casa Bianca",
    name: "Musc Vanille",
    gender: "female",
    year: 2018,
    image: "images/seed/p3.jpg",
    notes: {
      top: ["Бергамот"],
      heart: ["Ирис", "Мускус"],
      base: ["Ваниль", "Сандал", "Мускус"],
    },
    description:
      "Чистый белый мускус и сливочная ваниль на сандаловой подложке. Ирис добавляет акварельную пудровость — как тёплый кашемировый свитер.",
    characteristics: "Стойкость 6–8 часов · близкий к коже шлейф · каждый день",
    personalNotes: "Напоминает настроение Lazy Sunday Morning, но теплее.",
    rating: 4,
    favorite: true,
  },
  {
    id: "p-cuir-fume",
    brand: "Dark Oud Atelier",
    name: "Cuir Fumé",
    gender: "male",
    year: 2020,
    image: "images/seed/p4.jpg",
    notes: {
      top: ["Табак", "Бергамот"],
      heart: ["Кожа", "Уд"],
      base: ["Уд", "Древесные ноты"],
    },
    description:
      "Дымный уд и выделанная кожа, приглушённые табачным листом. Брутальный, собранный, с длинным древесным шлейфом.",
    characteristics: "Стойкость 12 часов · мощный шлейф · зима, вечер",
    personalNotes: "Хочу протестировать в холода. 2 распыла максимум.",
    rating: 5,
    favorite: false,
  },
  {
    id: "p-bergamot-rose",
    brand: "Verde",
    name: "Bergamot Rose",
    gender: "unisex",
    year: 2022,
    image: "images/seed/p5.jpg",
    notes: {
      top: ["Бергамот", "Нероли"],
      heart: ["Роза"],
      base: ["Мускус"],
    },
    description:
      "Прозрачная роза, умытая бергамотом и нероли. Лёгкий мускусный финал — аромат чистых рубашек и утреннего света.",
    characteristics: "Стойкость 5–6 часов · лёгкий шлейф · весна/лето, офис",
    personalNotes: "На каждый день — хорош, но ищу что-то поинтереснее.",
    rating: 3,
    favorite: false,
  },
  {
    id: "p-tabac-rose",
    brand: "Rose Imperiale",
    name: "Tabac Rose",
    gender: "male",
    year: 2017,
    image: "images/seed/p6.jpg",
    notes: {
      top: ["Роза"],
      heart: ["Табак", "Роза"],
      base: ["Ваниль", "Амбра"],
    },
    description:
      "Густая тёмная роза в табачном дыму с ванильно-амбровым теплом. Опьяняющий, винный, вечерний.",
    characteristics: "Стойкость 9–10 часов · плотный шлейф · осень/зима",
    personalNotes: "Напоминает Tobacco Vanille, но мягче и темнее.",
    rating: 4,
    favorite: true,
  },
];

export function buildSeed(): CatalogSnapshot {
  const now = Date.now();
  const notes: Note[] = NOTE_NAMES.map((name, i) => ({
    id: `n-${i + 1}`,
    name,
    createdAt: now - 1000 * (NOTE_NAMES.length - i),
  }));
  const byName = new Map(notes.map((n) => [n.name, n.id]));
  const idOf = (n: SeedNoteName) => byName.get(n)!;

  const perfumes: Perfume[] = SEED_PERFUMES.map((p, i) => ({
    id: p.id,
    brand: p.brand,
    name: p.name,
    gender: p.gender,
    year: p.year,
    image: p.image,
    notes: {
      top: p.notes.top.map(idOf),
      heart: p.notes.heart.map(idOf),
      base: p.notes.base.map(idOf),
    },
    description: p.description,
    characteristics: p.characteristics,
    personalNotes: p.personalNotes,
    rating: p.rating,
    favorite: p.favorite,
    createdAt: now - 1000 * 60 * (SEED_PERFUMES.length - i),
    updatedAt: now - 1000 * 60 * (SEED_PERFUMES.length - i),
  }));

  return { notes, perfumes };
}
