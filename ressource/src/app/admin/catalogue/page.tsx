"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trash2,
  Plus,
  Tag,
  HeartHandshake,
  Layers,
  type LucideIcon,
} from "lucide-react";

type ReferentielItem = {
  id: string;
  libelle: string;
};

interface RenderListProps {
  items: ReferentielItem[] | undefined;
  isLoading: boolean;
  icon: LucideIcon;
  onDelete: (variables: { id: string }) => void;
}

function RenderList({
  items,
  isLoading,
  icon: Icon,
  onDelete,
}: RenderListProps) {
  if (isLoading)
    return (
      <div className="text-muted-foreground animate-pulse p-4 text-center">
        Chargement...
      </div>
    );

  if (!items?.length)
    return (
      <div className="text-muted-foreground p-4 text-center">
        Aucun élément trouvé.
      </div>
    );

  return (
    <ul className="divide-border/50 mt-4 divide-y rounded-md border">
      {items.map((item) => (
        <li
          key={item.id}
          className="hover:bg-muted/50 flex items-center justify-between p-3 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon className="text-primary h-4 w-4" />
            <span className="font-medium">{item.libelle}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
                onDelete({ id: item.id });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

export default function GestionReferentielPage() {
  const utils = api.useUtils();

  const [nouvelleCategorie, setNouvelleCategorie] = useState("");
  const [nouveauTypeRelation, setNouveauTypeRelation] = useState("");
  const [nouveauTypeRessource, setNouveauTypeRessource] = useState("");

  const { data: categories, isLoading: loadCat } =
    api.ressource.getCategories.useQuery();
  const { data: relations, isLoading: loadRel } =
    api.ressource.getTypesRelation.useQuery();
  const { data: ressources, isLoading: loadRes } =
    api.ressource.getTypesRessource.useQuery();

  const addCat = api.admin.ajouterCategorie.useMutation({
    onSuccess: () => {
      toast.success("Catégorie ajoutée !");
      setNouvelleCategorie("");
      void utils.ressource.getCategories.invalidate();
    },
  });

  const addRel = api.admin.ajouterTypeRelation.useMutation({
    onSuccess: () => {
      toast.success("Type de relation ajouté !");
      setNouveauTypeRelation("");
      void utils.ressource.getTypesRelation.invalidate();
    },
  });

  const addRes = api.admin.ajouterTypeRessource.useMutation({
    onSuccess: () => {
      toast.success("Format de ressource ajouté !");
      setNouveauTypeRessource("");
      void utils.ressource.getTypesRessource.invalidate();
    },
  });

  const handleError = () => {
    toast.error(
      "Impossible de supprimer. Cet élément est probablement utilisé par une ressource existante.",
    );
  };

  const delCat = api.admin.supprimerCategorie.useMutation({
    onSuccess: () => {
      toast.success("Supprimé !");
      void utils.ressource.getCategories.invalidate();
    },
    onError: handleError,
  });

  const delRel = api.admin.supprimerTypeRelation.useMutation({
    onSuccess: () => {
      toast.success("Supprimé !");
      void utils.ressource.getTypesRelation.invalidate();
    },
    onError: handleError,
  });

  const delRes = api.admin.supprimerTypeRessource.useMutation({
    onSuccess: () => {
      toast.success("Supprimé !");
      void utils.ressource.getTypesRessource.invalidate();
    },
    onError: handleError,
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-black">
          Gestion du Référentiel
        </h1>
        <p className="text-muted-foreground">
          Administrez les listes déroulantes utilisées lors de la création de
          ressources.
        </p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="ressources">Formats</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Catégories thématiques</CardTitle>
              <CardDescription>
                Ex: Famille, Couple, Travail, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Nouvelle catégorie..."
                  value={nouvelleCategorie}
                  onChange={(e) => setNouvelleCategorie(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    nouvelleCategorie.trim() &&
                    addCat.mutate({ libelle: nouvelleCategorie })
                  }
                />
                <Button
                  disabled={!nouvelleCategorie.trim() || addCat.isPending}
                  onClick={() => addCat.mutate({ libelle: nouvelleCategorie })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </div>
              <RenderList
                items={categories}
                isLoading={loadCat}
                icon={Tag}
                onDelete={delCat.mutate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relations">
          <Card>
            <CardHeader>
              <CardTitle>Types de relations</CardTitle>
              <CardDescription>
                Ex: Soi-même, Conjoints, Enfants, Professionnel...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Nouveau type de relation..."
                  value={nouveauTypeRelation}
                  onChange={(e) => setNouveauTypeRelation(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    nouveauTypeRelation.trim() &&
                    addRel.mutate({ libelle: nouveauTypeRelation })
                  }
                />
                <Button
                  disabled={!nouveauTypeRelation.trim() || addRel.isPending}
                  onClick={() =>
                    addRel.mutate({ libelle: nouveauTypeRelation })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </div>
              <RenderList
                items={relations}
                isLoading={loadRel}
                icon={HeartHandshake}
                onDelete={delRel.mutate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ressources">
          <Card>
            <CardHeader>
              <CardTitle>Formats de ressources</CardTitle>
              <CardDescription>
                Ex: Article, Vidéo, Jeu, Activité...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Nouveau format..."
                  value={nouveauTypeRessource}
                  onChange={(e) => setNouveauTypeRessource(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    nouveauTypeRessource.trim() &&
                    addRes.mutate({ libelle: nouveauTypeRessource })
                  }
                />
                <Button
                  disabled={!nouveauTypeRessource.trim() || addRes.isPending}
                  onClick={() =>
                    addRes.mutate({ libelle: nouveauTypeRessource })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </div>
              <RenderList
                items={ressources}
                isLoading={loadRes}
                icon={Layers}
                onDelete={delRes.mutate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
