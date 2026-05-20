"use client";

import { format } from "date-fns";
import { CheckCircle, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function ModerationCommentairesPage() {
  const utils = api.useUtils();
  const { data: commentaires, isLoading } =
    api.admin.getCommentairesEnAttente.useQuery();

  const valider = api.admin.validerCommentaire.useMutation({
    onSuccess: () => {
      toast.success("Commentaire validé.");
      void utils.admin.getCommentairesEnAttente.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const supprimer = api.admin.supprimerCommentaire.useMutation({
    onSuccess: () => {
      toast.success("Commentaire supprimé.");
      void utils.admin.getCommentairesEnAttente.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-8 h-10 w-72" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const liste = commentaires ?? [];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-foreground flex items-center gap-3 text-3xl font-black">
          <MessageSquare className="text-primary h-8 w-8" />
          Modération des commentaires
        </h1>
        <p className="text-muted-foreground">
          Validez ou refusez les contributions avant leur affichage public.
        </p>
      </div>

      {liste.length === 0 ? (
        <div className="bg-card/50 rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">
            Aucun commentaire en attente de modération.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {liste.map((commentaire) => (
            <Card key={commentaire.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">
                    {commentaire.auteur.name}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {commentaire.auteur.email} ·{" "}
                    {format(
                      new Date(commentaire.date_publication),
                      "dd/MM/yyyy HH:mm",
                    )}
                  </p>
                </div>
                <Badge variant="outline">En attente</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="bg-muted/30 rounded-md p-4 text-sm whitespace-pre-wrap">
                  {commentaire.contenu}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/ressources/${commentaire.ressource.id}`}>
                      Voir la ressource : {commentaire.ressource.titre}
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => valider.mutate({ id: commentaire.id })}
                      disabled={valider.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Valider
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Supprimer ce commentaire ?")) {
                          supprimer.mutate({ id: commentaire.id });
                        }
                      }}
                      disabled={supprimer.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
