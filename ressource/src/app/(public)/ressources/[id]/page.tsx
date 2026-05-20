"use client";

import { use } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  CheckCircle2,
  Heart,
  HeartHandshake,
  Layers,
  PlayCircle,
  Share2,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { CommentSection } from "./_components/CommentSection";

export default function DetailRessourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = authClient.useSession();

  const {
    data: ressource,
    isLoading,
    error,
  } = api.ressource.getById.useQuery({ id });

  const { data: progression } = api.progression.getByRessource.useQuery(
    { ressourceId: id },
    { enabled: Boolean(session) },
  );

  const updateProgression = {
    favori: api.progression.setFavori.useMutation({
      onSuccess: async () => {
        await utils.progression.getByRessource.invalidate({ ressourceId: id });
        await utils.progression.getMonTableauDeBord.invalidate();
      },
    }),
    cote: api.progression.setMiseDeCote.useMutation({
      onSuccess: async () => {
        await utils.progression.getByRessource.invalidate({ ressourceId: id });
        await utils.progression.getMonTableauDeBord.invalidate();
      },
    }),
    exploitee: api.progression.setExploitee.useMutation({
      onSuccess: async () => {
        await utils.progression.getByRessource.invalidate({ ressourceId: id });
        await utils.progression.getMonTableauDeBord.invalidate();
      },
    }),
  };

  const creerSession = api.session.creer.useMutation({
    onSuccess: (nouvelleSession) => {
      router.push(`/sessions/${nouvelleSession.id}`);
    },
  });

  const logPartage = api.ressource.logPartage.useMutation();

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: ressource?.titre, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié.");
      }
      logPartage.mutate({ id });
    } catch {
      toast.error("Le partage a été annulé.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="mb-8 h-8 w-32" />
        <Skeleton className="mb-6 h-12 w-3/4" />
        <div className="mb-12 flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-100 w-full" />
      </div>
    );
  }

  if (error || !ressource) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-foreground mb-4 text-3xl font-bold">
          Ressource introuvable
        </h1>
        <p className="text-muted-foreground mb-8">
          La ressource que vous cherchez n&apos;existe pas ou n&apos;est plus
          disponible publiquement.
        </p>
        <Button asChild>
          <Link href="/catalogue">Retourner au catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-16">
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <Link
          href="/catalogue"
          className="text-muted-foreground hover:text-primary mb-8 inline-flex items-center text-sm font-medium transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au catalogue
        </Link>

        <header className="mb-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className="bg-secondary/20 text-secondary-foreground flex items-center gap-1.5 text-sm"
            >
              <Tag className="h-3.5 w-3.5" />
              {ressource.categorie.libelle}
            </Badge>
            <Badge
              variant="outline"
              className="border-primary/20 flex items-center gap-1.5 text-sm"
            >
              <HeartHandshake className="text-primary h-3.5 w-3.5" />
              {ressource.type_relation.libelle}
            </Badge>
            <Badge
              variant="outline"
              className="border-primary/20 flex items-center gap-1.5 text-sm"
            >
              <Layers className="text-primary h-3.5 w-3.5" />
              {ressource.type_ressource.libelle}
            </Badge>
          </div>

          <h1 className="text-foreground text-4xl font-black tracking-tight md:text-5xl">
            {ressource.titre}
          </h1>

          <div className="border-border/50 flex flex-wrap items-center justify-between gap-6 border-y py-4">
            <div className="text-muted-foreground flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-foreground font-medium">
                  Par {ressource.auteur.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Publié le{" "}
                  {format(new Date(ressource.date_creation), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </span>
              </div>
            </div>

            {session ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={progression?.est_favori ? "default" : "outline"}
                  onClick={() =>
                    updateProgression.favori.mutate({
                      ressourceId: id,
                      actif: !progression?.est_favori,
                    })
                  }
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Favori
                </Button>
                <Button
                  variant={
                    progression?.est_mise_de_cote ? "default" : "outline"
                  }
                  onClick={() =>
                    updateProgression.cote.mutate({
                      ressourceId: id,
                      actif: !progression?.est_mise_de_cote,
                    })
                  }
                >
                  <Bookmark className="mr-2 h-4 w-4" />À lire
                </Button>
                <Button
                  variant={progression?.est_exploitee ? "default" : "outline"}
                  onClick={() =>
                    updateProgression.exploitee.mutate({
                      ressourceId: id,
                      actif: !progression?.est_exploitee,
                    })
                  }
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Exploitée
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button>
                <Button
                  onClick={() => creerSession.mutate({ ressourceId: id })}
                  disabled={creerSession.isPending}
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {creerSession.isPending
                    ? "Création en cours..."
                    : "Démarrer une activité"}
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline">
                <Link href="/connexion">
                  Connectez-vous pour agir sur la ressource
                </Link>
              </Button>
            )}
          </div>
        </header>

        <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {ressource.contenu}
          </div>
        </article>

        <CommentSection ressourceId={id} />
      </main>
    </div>
  );
}
