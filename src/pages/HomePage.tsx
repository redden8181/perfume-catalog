import { useCatalog } from "../hooks/useCatalog";
import { CatalogBrowser } from "../components/CatalogBrowser";
import { plural } from "../core/utils";

export function HomePage() {
  const { perfumes, notes } = useCatalog();

  const subtitle =
    perfumes.length > 0
      ? `${perfumes.length} ${plural(perfumes.length, "аромат", "аромата", "ароматов")} · ${notes.length} ${plural(notes.length, "нота", "ноты", "нот")} в коллекции`
      : "Коллекция пуста — добавьте первый аромат";

  return (
    <CatalogBrowser
      title={
        <>
          Найди свой <span className="italic text-goldsoft">аромат</span>
        </>
      }
      subtitle={subtitle}
      emptyTitle="Ничего не найдено"
      emptyText="Попробуйте убрать часть нот, изменить режим совпадения или сбросить фильтры."
    />
  );
}
