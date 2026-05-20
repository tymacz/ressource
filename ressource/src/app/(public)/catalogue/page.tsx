"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useDebounce } from "@/hooks/use-debounce";
import { CatalogueFilters } from "./_components/CatalogueFilters";
import { RessourceList } from "./_components/RessourceList";
import { BookOpen } from "lucide-react";

export default function CataloguePage() {
  const [recherche, setRecherche] = useState("");
  const [categorieId, setCategorieId] = useState<string | undefined>(undefined);
  const [typeRelationId, setTypeRelationId] = useState<string | undefined>(
    undefined,
  );
  const [typeRessourceId, setTypeRessourceId] = useState<string | undefined>(
    undefined,
  );
  const [tri, setTri] = useState<"recent" | "ancien" | "titre">("recent");

  const debouncedRecherche = useDebounce(recherche, 400);

  const { data: categories, isLoading: isLoadingCats } =
    api.ressource.getCategories.useQuery();
  const { data: typesRelation, isLoading: isLoadingRel } =
    api.ressource.getTypesRelation.useQuery();
  const { data: typesRessource, isLoading: isLoadingTypes } =
    api.ressource.getTypesRessource.useQuery();

  const { data: ressources, isLoading: isLoadingRessources } =
    api.ressource.getAllPublic.useQuery({
      recherche: debouncedRecherche === "" ? undefined : debouncedRecherche,
      categorieId: categorieId,
      typeRelationId,
      typeRessourceId,
      tri,
    });

  return (
    <div className="bg-background min-h-screen pb-16">
      <section className="bg-primary/5 mb-8 border-b px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-4 flex items-center gap-4">
            <div className="bg-primary/20 text-primary inline-flex rounded-xl p-3">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black md:text-4xl">
              Catalogue des ressources
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg font-medium">
            Explorez notre bibliothèque publique. Filtrez par catégorie ou
            recherchez une thématique précise pour cultiver la qualité de vos
            relations.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4">
        <CatalogueFilters
          recherche={recherche}
          setRecherche={setRecherche}
          categorieId={categorieId}
          setCategorieId={setCategorieId}
          typeRelationId={typeRelationId}
          setTypeRelationId={setTypeRelationId}
          typeRessourceId={typeRessourceId}
          setTypeRessourceId={setTypeRessourceId}
          tri={tri}
          setTri={setTri}
          categories={categories ?? []}
          typesRelation={typesRelation ?? []}
          typesRessource={typesRessource ?? []}
          isLoadingCategories={isLoadingCats}
          isLoadingTypesRelation={isLoadingRel}
          isLoadingTypesRessource={isLoadingTypes}
        />

        <RessourceList
          ressources={ressources}
          isLoading={isLoadingRessources}
        />
      </section>
    </div>
  );
}
