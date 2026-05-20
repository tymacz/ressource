"use client";

import { use, useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Users, UserPlus, ArrowLeft, Loader2 } from "lucide-react";

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: userSession } = authClient.useSession();
  const utils = api.useUtils();

  const [nouveauMessage, setNouveauMessage] = useState("");
  const [emailInvite, setEmailInvite] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: sessionData,
    isLoading,
    error,
  } = api.session.getById.useQuery({ id }, { refetchInterval: 3000 });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionData?.messages]);

  const envoyerMessage = api.session.envoyerMessage.useMutation({
    onSuccess: () => {
      setNouveauMessage("");
      void utils.session.getById.invalidate({ id });
    },
  });

  const inviter = api.session.inviter.useMutation({
    onSuccess: () => {
      toast.success("Invitation envoyée !");
      setEmailInvite("");
      void utils.session.getById.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleEnvoyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauMessage.trim()) return;
    envoyerMessage.mutate({ sessionId: id, contenu: nouveauMessage });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  if (error || !sessionData)
    return (
      <div className="text-destructive py-24 text-center font-bold">
        Erreur : {error?.message ?? "Session introuvable"}
      </div>
    );

  const currentUserId = userSession?.user.id;
  const isInitiateur = sessionData.initiateur_id === currentUserId;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-100px)] max-w-6xl flex-col px-4 py-8">
      <Link
        href={`/ressources/${sessionData.ressource.id}`}
        className="text-muted-foreground hover:text-primary mb-6 inline-flex items-center text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la ressource
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-black">
            Activité : {sessionData.ressource.titre}
          </h1>
          <p className="text-muted-foreground text-sm">
            Animée par {sessionData.initiateur.name}
          </p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold">
          {sessionData.statut === "EN_COURS" ? "En cours" : "Terminée"}
        </div>
      </div>

      <div className="grid grow gap-6 md:grid-cols-3">
        <Card className="border-border/50 flex h-150 flex-col shadow-sm md:col-span-2">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              Discussions
            </CardTitle>
          </CardHeader>

          <CardContent className="bg-muted/10 grow space-y-4 overflow-y-auto p-4">
            {sessionData.messages.length === 0 ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-center italic">
                Aucun message pour le moment. Lancez la discussion !
              </div>
            ) : (
              sessionData.messages.map((msg) => {
                const isMe = msg.auteur.id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-muted-foreground text-xs font-semibold">
                        {isMe ? "Vous" : msg.auteur.name}
                      </span>
                      <span className="text-muted-foreground/70 text-[10px]">
                        {format(new Date(msg.date_envoi), "HH:mm")}
                      </span>
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card rounded-tl-none border shadow-sm"}`}
                    >
                      {msg.contenu}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="bg-card rounded-b-xl border-t p-4">
            <form onSubmit={handleEnvoyer} className="flex gap-2">
              <Input
                value={nouveauMessage}
                onChange={(e) => setNouveauMessage(e.target.value)}
                placeholder="Votre message..."
                disabled={sessionData.statut === "TERMINEE"}
                className="grow"
              />
              <Button
                type="submit"
                disabled={
                  !nouveauMessage.trim() ||
                  envoyerMessage.isPending ||
                  sessionData.statut === "TERMINEE"
                }
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" /> Participants (
                {sessionData.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-border/50 divide-y">
                {sessionData.participants.map((p) => (
                  <li
                    key={p.user.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="text-sm font-medium">
                      {p.user.name} {p.user.id === currentUserId && "(Vous)"}
                    </div>
                    {!p.a_accepte && (
                      <span className="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-500">
                        En attente
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {sessionData.statut === "EN_COURS" && isInitiateur && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/20 border-b py-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <UserPlus className="h-4 w-4" /> Inviter un citoyen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    inviter.mutate({ sessionId: id, email: emailInvite });
                  }}
                  className="flex flex-col gap-3"
                >
                  <Input
                    type="email"
                    placeholder="Adresse e-mail..."
                    value={emailInvite}
                    onChange={(e) => setEmailInvite(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full"
                    disabled={!emailInvite || inviter.isPending}
                  >
                    Envoyer l&apos;invitation
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
