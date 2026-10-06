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

export function parsePastedText(rawText: string): ParsedPerfumeData {
  // Убираем лишние пробелы и переносы
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

  // 3. Бренд и Название
  let name = "";
  let brand = "";
  
  // Английский: "Aventus by Creed is a..."
  const enMatch = clean.match(/^(.+?)\s+by\s+(.+?)\s+is a/i);
  // Русский: "Majnoon Azman — это аромат..."
  const ruMatch = clean.match(/^(.+?)\s+(?:—|-)\s*(?:это|аромат)/i);

  if (enMatch) {
    name = enMatch[1].trim();
    brand = enMatch[2].trim();
  } else if (ruMatch) {
    const rawName = ruMatch[1].trim();
    // Пытаемся отделить бренд от названия (обычно "Название Бренд")
    const parts = rawName.split(" ");
    if (parts.length >= 2) {
      brand = parts[parts.length - 1]; // последнее слово — бренд
      name = parts.slice(0, -1).join(" "); // всё остальное — название
    } else {
      name = rawName;
    }
  }

  // 4. Ноты (Русский) — используем [а-яё] вместо \w
  const topRu = clean.match(/[Вв]ерхн[а-яё]* нот[а-яё]*[:\s]+(.*?)(?=;\s*[Сс]редн|\.\s|$)/i);
  const heartRu = clean.match(/[Сс]редн[а-яё]* нот[а-яё]*[:\s]+(.*?)(?=;\s*[Бб]азов|\.\s|$)/i);
  const baseRu = clean.match(/[Бб]азов[а-яё]* нот[а-яё]*[:\s]+(.*?)(?=\.\s|$)/i);

  // 4. Ноты (Английский)
  const topEn = clean.match(/[Tt]op notes?\s+(?:are|is|:)\s*(.*?)(?=;\s*(?:middle|heart)|\.\s|$)/i);
  const heartEn = clean.match(/(?:[Mm]iddle|[Hh]eart) notes?\s+(?:are|is|:)\s*(.*?)(?=;\s*[Bb]ase|\.\s|$)/i);
  const baseEn = clean.match(/[Bb]ase notes?\s+(?:are|is|:)\s*(.*?)(?=\.\s|$)/i);

  const split = (s: string, isEn: boolean) => 
    s.split(/,| и | and /)
     .map(x => isEn ? translateNote(x) : x.trim().replace(/\.$/, ""))
     .filter(x => x.length > 1);

  const notes = {
    top: topRu ? split(topRu[1], false) : topEn ? split(topEn[1], true) : [],
    heart: heartRu ? split(heartRu[1], false) : heartEn ? split(heartEn[1], true) : [],
    base: baseRu ? split(baseRu[1], false) : baseEn ? split(baseEn[1], true) : [],
  };

  // Описание
  let description = clean
    .replace(/[Вв]ерхн[а-яё]* нот[а-яё]*:.*$/is, "")
    .replace(/[Тт]оп нот[а-яё]*:.*$/is, "")
    .replace(/Top notes?.*/is, "")
    .replace(/The nose behind.*/i, "")
    .replace(/Парфюмер:.*/i, "")
    .trim();

  return { name, brand, year, gender, description, notes };
}
