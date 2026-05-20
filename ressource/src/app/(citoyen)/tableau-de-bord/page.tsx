"use client";

import { api } from "@/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RessourceCard } from "@/app/(public)/catalogue/_components/RessourceCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Heart,
  Bookmark,
  CheckCircle,
  BookX,
  PenTool,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TableauDeBordPage() {
  const { data, isLoading, error } =
    api.progression.getMonTableauDeBord.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="mb-8 h-12 w-full max-w-2xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-destructive mb-4 text-2xl font-bold">
          Une erreur est survenue
        </h1>
        <p className="text-muted-foreground mb-8">
          Impossible de charger votre tableau de bord.
        </p>
        <Link href="/">
          <Button>Retourner à l&apos;accueil</Button>
        </Link>
      </div>
    );
  }

  const renderEmptyState = (
    message: string,
    actionText = "Explorer le catalogue",
    actionHref = "/catalogue",
  ) => (
    <div className="bg-card/50 mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <BookX className="text-muted-foreground mb-4 h-10 w-10 opacity-50" />
      <p className="text-foreground text-lg font-medium">{message}</p>
      <Link href={actionHref} className="mt-4">
        <Button variant="outline">{actionText}</Button>
      </Link>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pb-16">
      <section className="bg-primary/5 mb-8 border-b px-4 py-10">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-2 flex items-center gap-4">
            <div className="bg-primary/20 text-primary inline-flex rounded-xl p-3">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black md:text-4xl">
              Mon Tableau de Bord
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl font-medium">
            Retrouvez ici toutes vos ressources favorites, celles à lire plus
            tard, votre historique de consultation et vos propres créations.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4">
        <Tabs defaultValue="favoris" className="w-full">
          <TabsList className="mb-8 grid h-auto w-full max-w-2xl grid-cols-2 gap-1 p-1 md:grid-cols-4">
            <TabsTrigger
              value="favoris"
              className="flex items-center gap-2 py-2.5"
            >
              <Heart className="h-4 w-4" />
              Favoris
            </TabsTrigger>
            <TabsTrigger
              value="mises_de_cote"
              className="flex items-center gap-2 py-2.5"
            >
              <Bookmark className="h-4 w-4" />À lire
            </TabsTrigger>
            <TabsTrigger
              value="historique"
              className="flex items-center gap-2 py-2.5"
            >
              <CheckCircle className="h-4 w-4" />
              Terminées
            </TabsTrigger>
            <TabsTrigger
              value="creations"
              className="flex items-center gap-2 py-2.5"
            >
              <PenTool className="h-4 w-4" />
              Mes Créations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favoris">
            {data.favoris.length === 0 ? (
              renderEmptyState(
                "Vous n'avez pas encore de ressources favorites.",
              )
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.favoris.map((prog) => (
                  <RessourceCard
                    key={prog.ressource_id}
                    id={prog.ressource.id}
                    titre={prog.ressource.titre}
                    nomAuteur={prog.ressource.auteur.name}
                    libelleCategorie={prog.ressource.categorie.libelle}
                    dateCreation={prog.ressource.date_creation}
                    visibilite={prog.ressource.visibilite}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mises_de_cote">
            {data.misesDeCote.length === 0 ? (
              renderEmptyState("Vous n'avez aucune ressource mise de côté.")
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.misesDeCote.map((prog) => (
                  <RessourceCard
                    key={prog.ressource_id}
                    id={prog.ressource.id}
                    titre={prog.ressource.titre}
                    nomAuteur={prog.ressource.auteur.name}
                    libelleCategorie={prog.ressource.categorie.libelle}
                    dateCreation={prog.ressource.date_creation}
                    visibilite={prog.ressource.visibilite}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historique">
            {data.exploitees.length === 0 ? (
              renderEmptyState("Vous n'avez pas encore exploité de ressources.")
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.exploitees.map((prog) => (
                  <RessourceCard
                    key={prog.ressource_id}
                    id={prog.ressource.id}
                    titre={prog.ressource.titre}
                    nomAuteur={prog.ressource.auteur.name}
                    libelleCategorie={prog.ressource.categorie.libelle}
                    dateCreation={prog.ressource.date_creation}
                    visibilite={prog.ressource.visibilite}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="creations">
            {data.mesCreations.length === 0 ? (
              renderEmptyState(
                "Vous n'avez pas encore créé de ressource.",
                "Créer une ressource",
                "/mes-ressources/creer",
              )
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.mesCreations.map((ressource) => (
                  <RessourceCard
                    key={ressource.id}
                    id={ressource.id}
                    titre={ressource.titre}
                    nomAuteur={ressource.auteur.name}
                    libelleCategorie={ressource.categorie.libelle}
                    dateCreation={ressource.date_creation}
                    visibilite={ressource.visibilite}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
