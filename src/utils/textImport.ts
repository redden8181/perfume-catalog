import type { Gender } from "../core/types";

export interface ParsedPerfumeData {
  name: string;
  brand: string;
  year: number | null;
  gender: Gender;
  description: string;
  notes: { top: string[]; heart: string[]; base: string[] };
}

/* ───── EN→RU словарь нот (для английских текстов) ───── */
const TRAN: Record<string, string> = {
  "Bergamot": "Бергамот", "Lemon": "Лимон", "Lime": "Лайм",
  "Grapefruit": "Грейпфрут", "Orange": "Апельсин", "Mandarin Orange": "Мандарин",
  "Neroli": "Нероли", "Petitgrain": "Петитгрен", "Yuzu": "Юдзу",
  "Rose": "Роза", "Jasmine": "Жасмин", "Violet": "Фиалка", "Iris": "Ирис",
  "Lily": "Лилия", "Peony": "Пион", "Magnolia": "Магнолия",
  "Tuberose": "Тубероза", "Gardenia": "Гардения", "Ylang-Ylang": "Иланг-иланг",
  "Lavender": "Лаванда", "Geranium": "Герань", "Mimosa": "Мимоза",
  "Lily of the Valley": "Ландыш", "Orange Blossom": "Цветок апельсина",
  "Osmanthus": "Османтус", "Orris Root": "Корень ириса",
  "Raspberry": "Малина", "Blackberry": "Ежевика", "Strawberry": "Клубника",
  "Black Currant": "Чёрная смородина", "Peach": "Персик", "Pear": "Груша",
  "Apple": "Яблоко", "Plum": "Слива", "Cherry": "Вишня",
  "Pineapple": "Ананас", "Fig": "Инжир", "Mango": "Манго",
  "Passion Fruit": "Маракуйя", "Lychee": "Личи", "Pomegranate": "Гранат",
  "Black Pepper": "Чёрный перец", "Pink Pepper": "Розовый перец",
  "Cardamom": "Кардамон", "Cinnamon": "Корица", "Cloves": "Гвоздика",
  "Nutmeg": "Мускатный орех", "Saffron": "Шафран", "Ginger": "Имбирь",
  "Anise": "Анис", "Tarragon": "Эстрагон",
  "Sandalwood": "Сандал", "Cedarwood": "Кедр", "Cedar": "Кедр",
  "Vetiver": "Ветивер", "Patchouli": "Пачули", "Oud": "Уд",
  "Guaiac Wood": "Гваяковое дерево", "Birch": "Берёза",
  "Oakmoss": "Дубовый мох", "Pine": "Сосна", "Cypress": "Кипарис",
  "Musk": "Мускус", "White Musk": "Белый мускус", "Amber": "Амбра",
  "Ambergris": "Амбергрис", "Ambroxan": "Амброксан", "Labdanum": "Ладанум",
  "Benzoin": "Бензоин", "Tonka Bean": "Бобы тонка",
  "Leather": "Кожа", "Tobacco": "Табак", "Incense": "Ладан",
  "Frankincense": "Ладан", "Myrrh": "Мирра", "Castoreum": "Кастореум",
  "Vanilla": "Ваниль", "Caramel": "Карамель", "Honey": "Мёд",
  "Chocolate": "Шоколад", "Coffee": "Кофе", "Cocoa": "Какао",
  "Moss": "Мох", "Grass": "Трава", "Mint": "Мята",
  "Basil": "Базилик", "Rosemary": "Розмарин", "Sage": "Шалфей",
  "Galbanum": "Гальбан", "Juniper": "Можжевельник",
  "Coumarin": "Кумарин", "Heliotrope": "Гелиотроп",
};

function translateNote(n: string): string {
  const trimmed = n.trim().replace(/\.$/, "");
  return TRAN[trimmed] ?? trimmed;
}

function splitNotes(s: string, isEn: boolean): string[] {
  return s
    .split(/,| и | and /)
    .map((x) => (isEn ? translateNote(x) : x.trim().replace(/\.$/, "")))
    .map((x) => x.trim())
    .filter((x) => x.length > 1);
}

export function parsePastedText(rawText: string): ParsedPerfumeData {
  const clean = rawText.replace(/\s+/g, " ").trim();

  // 1. Пол
  let gender: Gender = "unisex";
  const lower = clean.toLowerCase();
  if (lower.includes("для мужчин и женщин") || lower.includes("unisex")) gender = "unisex";
  else if (lower.includes("для женщин") || lower.includes("for women")) gender = "female";
  else if (lower.includes("для мужчин") || lower.includes("for men")) gender = "male";

  // 2. Год
  const yearMatch = clean.match(/(?:выпущен в|launched in|released in)\s*(\d{4})/i)
    ?? clean.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // 3. Бренд и название
  let name = "";
  let brand = "";

  const enMatch = clean.match(/^(.+?)\s+by\s+(.+?)\s+is a/i);
  const ruMatch = clean.match(/^(.+?)\s+(?:—|-)\s*(?:это|аромат)/i);

  if (enMatch) {
    name = enMatch[1].trim();
    brand = enMatch[2].trim();
  } else if (ruMatch) {
    const rawName = ruMatch[1].trim();
    const parts = rawName.split(" ");
    if (parts.length >= 2) {
      brand = parts[parts.length - 1];
      name = parts.slice(0, -1).join(" ");
    } else {
      name = rawName;
    }
  }

  // 4. Ноты по пирамидам
  const topRu = clean.match(/[Вв]ерхн[а-яё]*\s+нот[а-яё]*[:\s]+(.*?)(?=;\s*[Сс]редн|\.\s|$)/i);
  const heartRu = clean.match(/[Сс]редн[а-яё]*\s+нот[а-яё]*[:\s]+(.*?)(?=;\s*[Бб]азов|\.\s|$)/i);
  const baseRu = clean.match(/[Бб]азов[а-яё]*\s+нот[а-яё]*[:\s]+(.*?)(?=\.\s|$)/i);

  const topEn = clean.match(/[Tt]op notes?\s+(?:are|is|:)\s*(.*?)(?=;\s*(?:middle|heart)|\.\s|$)/i);
  const heartEn = clean.match(/(?:[Mm]iddle|[Hh]eart) notes?\s+(?:are|is|:)\s*(.*?)(?=;\s*[Bb]ase|\.\s|$)/i);
  const baseEn = clean.match(/[Bb]ase notes?\s+(?:are|is|:)\s*(.*?)(?=\.\s|$)/i);

  let notes = {
    top: topRu ? splitNotes(topRu[1], false) : topEn ? splitNotes(topEn[1], true) : [],
    heart: heartRu ? splitNotes(heartRu[1], false) : heartEn ? splitNotes(heartEn[1], true) : [],
    base: baseRu ? splitNotes(baseRu[1], false) : baseEn ? splitNotes(baseEn[1], true) : [],
  };

  // 5. Если пирамиды нет, но есть просто «включает ноты / features» — кладём всё в базовые
  const flatRu = clean.match(/(?:Композиция аромата включает ноты|Аромат включает ноты|Ноты)[:\s]+(.*?)(?=\.\s|$)/i);
  const flatEn = clean.match(/(?:The fragrance features|Composition includes|Notes include)\s*(.*?)(?=\.\s|$)/i);

  const total = notes.top.length + notes.heart.length + notes.base.length;
  if (total === 0) {
    if (flatRu) {
      notes = { top: [], heart: [], base: splitNotes(flatRu[1], false) };
    } else if (flatEn) {
      notes = { top: [], heart: [], base: splitNotes(flatEn[1], true) };
    }
  }

  // 6. Описание
  let description = clean
    .replace(/[Вв]ерхн[а-яё]*\s+нот[а-яё]*:.*$/is, "")
    .replace(/[Тт]оп\s+нот[а-яё]*:.*$/is, "")
    .replace(/Top notes?.*/is, "")
    .replace(/(?:Композиция аромата включает ноты|The fragrance features).*$/is, "")
    .replace(/The nose behind.*/i, "")
    .replace(/Парфюмер:.*/i, "")
    .trim();

  return { name, brand, year, gender, description, notes };
}
