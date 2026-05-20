import { BookX } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { RessourceCard } from "./RessourceCard";

type RessourceItem = {
  id: string;
  titre: string;
  date_creation: Date;
  visibilite: "PUBLIQUE" | "PARTAGEE" | "PRIVEE";
  categorie: { libelle: string };
  type_relation?: { libelle: string };
  type_ressource?: { libelle: string };
  auteur: { name: string };
};

interface RessourceListProps {
  ressources: RessourceItem[] | undefined;
  isLoading: boolean;
}

export function RessourceList({ ressources, isLoading }: RessourceListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!ressources || ressources.length === 0) {
    return (
      <div className="bg-card/50 flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
        <BookX className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
        <h3 className="text-foreground text-xl font-bold">
          Aucune ressource trouvée
        </h3>
        <p className="text-muted-foreground mt-2">
          Essayez de modifier vos filtres de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {ressources.map((ressource) => (
        <RessourceCard
          key={ressource.id}
          id={ressource.id}
          titre={ressource.titre}
          nomAuteur={ressource.auteur.name}
          libelleCategorie={ressource.categorie.libelle}
          libelleRelation={ressource.type_relation?.libelle}
          libelleType={ressource.type_ressource?.libelle}
          dateCreation={ressource.date_creation}
          visibilite={ressource.visibilite}
        />
      ))}
    </div>
  );
}
