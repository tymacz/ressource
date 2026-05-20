"use client";

import { useState, type FormEvent } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Reply, Send, Trash2, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { canModerate } from "@/lib/auth/roles";
import { api } from "@/trpc/react";

type Auteur = { id: string; name: string };
type Reponse = {
  id: string;
  contenu: string;
  date_publication: Date;
  auteur: Auteur;
};
type Commentaire = {
  id: string;
  contenu: string;
  date_publication: Date;
  auteur: Auteur;
  reponses: Reponse[];
};

export function CommentSection({ ressourceId }: { ressourceId: string }) {
  const utils = api.useUtils();
  const { data: session } = authClient.useSession();

  const [nouveauCommentaire, setNouveauCommentaire] = useState("");
  const [reponseA, setReponseA] = useState<string | null>(null);
  const [texteReponse, setTexteReponse] = useState("");

  const { data: commentaires, isLoading } =
    api.commentaire.getByRessource.useQuery({ ressourceId });

  const ajouterMutation = api.commentaire.ajouter.useMutation({
    onSuccess: (commentaire) => {
      toast.success(
        commentaire.est_modere
          ? "Commentaire publié !"
          : "Commentaire envoyé en modération.",
      );
      setNouveauCommentaire("");
      setTexteReponse("");
      setReponseA(null);
      void utils.commentaire.getByRessource.invalidate({ ressourceId });
      void utils.admin.getCommentairesEnAttente.invalidate();
    },
    onError: () => toast.error("Erreur lors de la publication."),
  });

  const supprimerMutation = api.commentaire.supprimer.useMutation({
    onSuccess: () => {
      toast.success("Commentaire supprimé.");
      void utils.commentaire.getByRessource.invalidate({ ressourceId });
    },
  });

  const handleAjouter = (event: FormEvent) => {
    event.preventDefault();
    if (!nouveauCommentaire.trim()) return;
    ajouterMutation.mutate({ ressourceId, contenu: nouveauCommentaire });
  };

  const handleRepondre = (parentId: string) => {
    if (!texteReponse.trim()) return;
    ajouterMutation.mutate({ ressourceId, contenu: texteReponse, parentId });
  };

  if (isLoading) {
    return (
      <div className="bg-muted mt-8 h-32 w-full animate-pulse rounded-lg" />
    );
  }

  const typedCommentaires = (commentaires as Commentaire[]) ?? [];
  const canDeleteAsStaff = canModerate(session?.user.role_id);

  return (
    <section className="border-border/50 mt-16 border-t pt-8">
      <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
        <MessageSquare className="h-6 w-6" />
        Commentaires (
        {typedCommentaires.length +
          typedCommentaires.reduce(
            (total, commentaire) => total + commentaire.reponses.length,
            0,
          )}
        )
      </h2>

      {session ? (
        <form
          onSubmit={handleAjouter}
          className="border-border/50 bg-muted/20 mb-10 rounded-xl border p-4"
        >
          <textarea
            value={nouveauCommentaire}
            onChange={(event) => setNouveauCommentaire(event.target.value)}
            placeholder="Partagez votre avis ou posez une question..."
            className="bg-background focus:ring-primary/50 mb-3 min-h-25 w-full resize-y rounded-md border p-3 text-sm focus:ring-2 focus:outline-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!nouveauCommentaire.trim() || ajouterMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" /> Publier
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-border/50 bg-muted/30 mb-10 rounded-xl border p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Vous devez être connecté pour participer à la discussion.
          </p>
          <Button asChild variant="outline">
            <Link href="/connexion">Se connecter</Link>
          </Button>
        </div>
      )}

      <div className="space-y-8">
        {typedCommentaires.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center italic">
            Soyez le premier à commenter cette ressource !
          </p>
        ) : (
          typedCommentaires.map((commentaire) => (
            <div key={commentaire.id} className="flex gap-4">
              <div className="mt-1 shrink-0">
                <UserCircle2 className="text-muted-foreground/50 h-10 w-10" />
              </div>

              <div className="grow space-y-4">
                <div className="bg-card rounded-2xl rounded-tl-none border p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {commentaire.auteur.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        il y a{" "}
                        {formatDistanceToNow(
                          new Date(commentaire.date_publication),
                          { locale: fr },
                        )}
                      </span>
                    </div>

                    {(session?.user.id === commentaire.auteur.id ||
                      canDeleteAsStaff) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-6 w-6"
                        onClick={() => {
                          if (confirm("Supprimer ce commentaire ?")) {
                            supprimerMutation.mutate({ id: commentaire.id });
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-foreground/90 text-sm whitespace-pre-wrap">
                    {commentaire.contenu}
                  </p>

                  {session && (
                    <button
                      type="button"
                      onClick={() =>
                        setReponseA(
                          reponseA === commentaire.id ? null : commentaire.id,
                        )
                      }
                      className="text-muted-foreground hover:text-primary mt-3 flex items-center gap-1 text-xs font-medium transition-colors"
                    >
                      <Reply className="h-3 w-3" /> Répondre
                    </button>
                  )}
                </div>

                {reponseA === commentaire.id && (
                  <div className="flex gap-3 pl-4">
                    <UserCircle2 className="text-primary/50 h-8 w-8 shrink-0" />
                    <div className="flex grow gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={texteReponse}
                        onChange={(event) =>
                          setTexteReponse(event.target.value)
                        }
                        placeholder={`Répondre à ${commentaire.auteur.name}...`}
                        className="bg-background focus:ring-primary/50 grow rounded-md border px-3 text-sm focus:ring-2 focus:outline-none"
                        onKeyDown={(event) => {
                          if (event.key === "Enter")
                            handleRepondre(commentaire.id);
                        }}
                      />
                      <Button
                        size="sm"
                        disabled={!texteReponse.trim()}
                        onClick={() => handleRepondre(commentaire.id)}
                      >
                        Envoyer
                      </Button>
                    </div>
                  </div>
                )}

                {commentaire.reponses.length > 0 && (
                  <div className="border-muted/50 mt-4 space-y-4 border-l-2 pl-4 sm:pl-8">
                    {commentaire.reponses.map((reponse) => (
                      <div key={reponse.id} className="flex gap-3">
                        <UserCircle2 className="text-muted-foreground/40 mt-1 h-8 w-8 shrink-0" />
                        <div className="border-border/50 bg-muted/30 grow rounded-2xl rounded-tl-none border p-3">
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">
                                {reponse.auteur.name}
                              </span>
                              <span className="text-muted-foreground text-[10px]">
                                {formatDistanceToNow(
                                  new Date(reponse.date_publication),
                                  { locale: fr },
                                )}
                              </span>
                            </div>
                            {(session?.user.id === reponse.auteur.id ||
                              canDeleteAsStaff) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive h-5 w-5"
                                onClick={() => {
                                  if (confirm("Supprimer cette réponse ?")) {
                                    supprimerMutation.mutate({
                                      id: reponse.id,
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-foreground/80 text-sm">
                            {reponse.contenu}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
