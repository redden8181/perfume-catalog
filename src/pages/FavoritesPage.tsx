import { Heart } from "lucide-react";
import { useCatalog } from "../hooks/useCatalog";
import { CatalogBrowser } from "../components/CatalogBrowser";
import { plural } from "../core/utils";

export function FavoritesPage() {
  const { perfumes } = useCatalog();
  const count = perfumes.filter((p) => p.favorite).length;

  return (
    <CatalogBrowser
      fixedFavorites
      title={
        <>
          Избранное <Heart size={22} className="mb-1 inline fill-gold text-gold" />
        </>
      }
      subtitle={`${count} ${plural(count, "аромат", "аромата", "ароматов")} отмечено сердечком`}
      emptyTitle="В избранном пусто"
      emptyText="Отмечайте понравившиеся ароматы сердечком — они появятся здесь."
    />
  );
}
