import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Referentiel {
  id: string;
  libelle: string;
}

interface CatalogueFiltersProps {
  recherche: string;
  setRecherche: (value: string) => void;
  categorieId: string | undefined;
  setCategorieId: (value: string | undefined) => void;
  typeRelationId: string | undefined;
  setTypeRelationId: (value: string | undefined) => void;
  typeRessourceId: string | undefined;
  setTypeRessourceId: (value: string | undefined) => void;
  tri: "recent" | "ancien" | "titre";
  setTri: (value: "recent" | "ancien" | "titre") => void;
  categories: Referentiel[];
  typesRelation: Referentiel[];
  typesRessource: Referentiel[];
  isLoadingCategories: boolean;
  isLoadingTypesRelation: boolean;
  isLoadingTypesRessource: boolean;
}

const ALL_VALUE = "tous";

export function CatalogueFilters({
  recherche,
  setRecherche,
  categorieId,
  setCategorieId,
  typeRelationId,
  setTypeRelationId,
  typeRessourceId,
  setTypeRessourceId,
  tri,
  setTri,
  categories,
  typesRelation,
  typesRessource,
  isLoadingCategories,
  isLoadingTypesRelation,
  isLoadingTypesRessource,
}: CatalogueFiltersProps) {
  const toOptionalValue = (value: string) =>
    value === ALL_VALUE ? undefined : value;

  return (
    <div className="bg-card mb-8 grid gap-4 rounded-xl border p-4 shadow-sm lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Rechercher une ressource..."
          className="pl-10"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
        />
      </div>

      <Select
        value={categorieId ?? ALL_VALUE}
        onValueChange={(value) => setCategorieId(toOptionalValue(value))}
        disabled={isLoadingCategories}
      >
        <SelectTrigger>
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Toutes les catégories</SelectItem>
          {categories.map((categorie) => (
            <SelectItem key={categorie.id} value={categorie.id}>
              {categorie.libelle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={typeRelationId ?? ALL_VALUE}
        onValueChange={(value) => setTypeRelationId(toOptionalValue(value))}
        disabled={isLoadingTypesRelation}
      >
        <SelectTrigger>
          <SelectValue placeholder="Relation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Toutes les relations</SelectItem>
          {typesRelation.map((typeRelation) => (
            <SelectItem key={typeRelation.id} value={typeRelation.id}>
              {typeRelation.libelle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={typeRessourceId ?? ALL_VALUE}
        onValueChange={(value) => setTypeRessourceId(toOptionalValue(value))}
        disabled={isLoadingTypesRessource}
      >
        <SelectTrigger>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Tous les types</SelectItem>
          {typesRessource.map((typeRessource) => (
            <SelectItem key={typeRessource.id} value={typeRessource.id}>
              {typeRessource.libelle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={tri}
        onValueChange={(value) =>
          setTri(value as "recent" | "ancien" | "titre")
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Tri" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Plus récentes</SelectItem>
          <SelectItem value="ancien">Plus anciennes</SelectItem>
          <SelectItem value="titre">Titre A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
