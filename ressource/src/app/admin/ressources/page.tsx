"use client";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Clock,
  AlertTriangle,
} from "lucide-react";

type RessourceModeree = {
  id: string;
  titre: string;
  date_creation: Date;
  visibilite: "PUBLIQUE" | "PARTAGEE" | "PRIVEE";
  statut_publication: "BROUILLON" | "EN_ATTENTE" | "VALIDEE" | "SUSPENDUE";
  categorie: { libelle: string } | null;
  auteur: { name: string; email: string };
};

interface ListeRessourcesProps {
  liste: RessourceModeree[];
  emptyMessage: string;
  onValider: (id: string) => void;
  onSuspendre: (id: string) => void;
  onSupprimer: (id: string) => void;
}

function ListeRessources({
  liste,
  emptyMessage,
  onValider,
  onSuspendre,
  onSupprimer,
}: ListeRessourcesProps) {
  if (!liste || liste.length === 0) {
    return (
      <div className="bg-card/50 mt-4 rounded-lg border border-dashed py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-4">
      {liste.map((ressource) => (
        <Card
          key={ressource.id}
          className="flex flex-col items-start justify-between gap-4 overflow-hidden sm:flex-row sm:items-center"
        >
          <div className="grow p-4 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary">
                {ressource.categorie?.libelle ?? "Sans catégorie"}
              </Badge>
              <Badge
                variant={
                  ressource.visibilite === "PUBLIQUE" ? "default" : "outline"
                }
              >
                {ressource.visibilite}
              </Badge>
            </div>
            <h3 className="mb-1 line-clamp-1 text-lg font-bold">
              {ressource.titre}
            </h3>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              Par{" "}
              <span className="text-foreground font-medium">
                {ressource.auteur.name}
              </span>
              <span>•</span>
              {format(new Date(ressource.date_creation), "d MMM yyyy", {
                locale: fr,
              })}
            </p>
          </div>

          <div className="bg-muted/30 border-border/50 flex w-full items-center gap-2 border-t p-4 sm:w-auto sm:border-t-0 sm:border-l sm:bg-transparent sm:p-6">
            <Button
              variant="outline"
              size="icon"
              asChild
              title="Voir la ressource"
            >
              <Link href={`/ressources/${ressource.id}`} target="_blank">
                <Eye className="h-4 w-4" />
              </Link>
            </Button>

            {ressource.statut_publication !== "VALIDEE" && (
              <Button
                variant="default"
                className="bg-green-600 text-white hover:bg-green-700"
                size="icon"
                title="Valider la publication"
                onClick={() => onValider(ressource.id)}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}

            {ressource.statut_publication !== "SUSPENDUE" && (
              <Button
                variant="outline"
                className="text-orange-600 hover:bg-orange-50"
                size="icon"
                title="Suspendre la publication"
                onClick={() => onSuspendre(ressource.id)}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="destructive"
              size="icon"
              title="Supprimer définitivement"
              onClick={() => {
                if (
                  confirm(
                    "Supprimer cette ressource DÉFINITIVEMENT ? Cette action est irréversible.",
                  )
                ) {
                  onSupprimer(ressource.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// 3. COMPOSANT PRINCIPAL
export default function ModerationRessourcesPage() {
  const utils = api.useUtils();

  const { data: ressources, isLoading } = api.admin.getAllRessources.useQuery();

  const changerStatut = api.admin.changerStatutRessource.useMutation({
    onSuccess: (_, variables) => {
      const message =
        variables.nouveauStatut === "VALIDEE"
          ? "Ressource validée !"
          : "Ressource suspendue.";
      toast.success(message);
      void utils.admin.getAllRessources.invalidate();
    },
    onError: () =>
      toast.error("Une erreur est survenue lors du changement de statut."),
  });

  const supprimer = api.admin.supprimerRessource.useMutation({
    onSuccess: () => {
      toast.success("Ressource supprimée définitivement.");
      void utils.admin.getAllRessources.invalidate();
    },
    onError: () => toast.error("Erreur lors de la suppression."),
  });

  if (isLoading) {
    return (
      <div className="text-muted-foreground animate-pulse p-8 text-center">
        Chargement des ressources...
      </div>
    );
  }

  // On force le typage ici pour que TypeScript soit content
  const typedRessources = (ressources as RessourceModeree[]) || [];

  const enAttente = typedRessources.filter(
    (r) => r.statut_publication === "EN_ATTENTE",
  );
  const validees = typedRessources.filter(
    (r) => r.statut_publication === "VALIDEE",
  );
  const suspendues = typedRessources.filter(
    (r) => r.statut_publication === "SUSPENDUE",
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-black">
          Modération des Ressources
        </h1>
        <p className="text-muted-foreground">
          Examinez, validez ou bloquez les publications des citoyens.
        </p>
      </div>

      <Tabs defaultValue="attente" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="attente" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            En attente
            {enAttente.length > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 flex h-5 w-5 items-center justify-center rounded-full p-0"
              >
                {enAttente.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="validees" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Validées
          </TabsTrigger>
          <TabsTrigger value="suspendues" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Suspendues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attente">
          <ListeRessources
            liste={enAttente}
            emptyMessage="Super ! Aucune ressource n'est en attente de modération."
            onValider={(id) =>
              changerStatut.mutate({ id, nouveauStatut: "VALIDEE" })
            }
            onSuspendre={(id) =>
              changerStatut.mutate({ id, nouveauStatut: "SUSPENDUE" })
            }
            onSupprimer={(id) => supprimer.mutate({ id })}
          />
        </TabsContent>

        <TabsContent value="validees">
          <ListeRessources
            liste={validees}
            emptyMessage="Aucune ressource n'a encore été validée."
            onValider={(id) =>
              changerStatut.mutate({ id, nouveauStatut: "VALIDEE" })
            }
            onSuspendre={(id) =>
              changerStatut.mutate({ id, nouveauStatut: "SUSPENDUE" })
            }
            onSupprimer={(id) => supprimer.mutate({ id })}
          />
        </TabsContent>

        <TabsContent value="suspendues">
          <ListeRessources
            liste={suspendues}
            emptyMessage="Aucune ressource n'est actuellement suspendue."
            onValider={(id) =>
              changerStatut.mutate({ id, nouveauStatut: "VALIDEE" })
            }
            onSuspendre={(id) =>
              changerStatut.mutate({ id, nouveauStatut: "SUSPENDUE" })
            }
            onSupprimer={(id) => supprimer.mutate({ id })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
