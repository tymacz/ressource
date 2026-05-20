"use client";

import { format } from "date-fns";
import { Calendar, Mail, Shield, UserCheck, UserX, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { ROLE_VALUES, getRoleLabel, type RoleUser } from "@/lib/auth/roles";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type UtilisateurAdmin = {
  id: string;
  name: string;
  email: string;
  role_id: RoleUser;
  est_actif: boolean;
  date_creation: Date;
};

export default function GestionUtilisateursPage() {
  const utils = api.useUtils();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id;

  const { data: utilisateurs, isLoading } = api.admin.getAllUsers.useQuery();

  const changerStatut = api.admin.changerStatutUtilisateur.useMutation({
    onSuccess: (_, variables) => {
      toast.success(
        variables.est_actif ? "Compte réactivé." : "Compte désactivé.",
      );
      void utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const changerRole = api.admin.changerRoleUtilisateur.useMutation({
    onSuccess: (_, variables) => {
      toast.success(`Rôle mis à jour : ${getRoleLabel(variables.role)}.`);
      void utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="mb-8 h-6 w-96" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const typedUsers = (utilisateurs as UtilisateurAdmin[]) ?? [];
  const citoyens = typedUsers.filter((user) => user.role_id === "CITOYEN");
  const equipe = typedUsers.filter((user) => user.role_id !== "CITOYEN");
  const inactifs = typedUsers.filter((user) => !user.est_actif);

  const renderUsers = (liste: UtilisateurAdmin[]) => {
    if (liste.length === 0) {
      return (
        <div className="bg-card/50 mt-4 rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">Aucun utilisateur trouvé.</p>
        </div>
      );
    }

    return (
      <div className="mt-4 grid gap-4">
        {liste.map((user) => {
          const isMe = user.id === currentUserId;

          return (
            <Card
              key={user.id}
              className={`flex flex-col items-start justify-between gap-4 overflow-hidden sm:flex-row sm:items-center ${
                !user.est_actif ? "bg-muted/20 opacity-75" : ""
              }`}
            >
              <div className="grow p-4 sm:p-6">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      user.role_id === "CITOYEN" ? "secondary" : "default"
                    }
                  >
                    {getRoleLabel(user.role_id)}
                  </Badge>
                  {!user.est_actif && (
                    <Badge variant="destructive">Compte désactivé</Badge>
                  )}
                  {isMe && (
                    <Badge
                      variant="outline"
                      className="border-primary text-primary"
                    >
                      Vous
                    </Badge>
                  )}
                </div>

                <h3 className="mb-1 text-lg font-bold">{user.name}</h3>

                <div className="text-muted-foreground mt-2 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Inscrit le{" "}
                    {format(new Date(user.date_creation), "dd/MM/yyyy")}
                  </div>
                </div>
              </div>

              {!isMe && (
                <div className="border-border/50 bg-muted/30 flex w-full flex-wrap items-center gap-2 border-t p-4 sm:w-auto sm:border-t-0 sm:border-l sm:bg-transparent sm:p-6">
                  <select
                    value={user.role_id}
                    onChange={(event) =>
                      changerRole.mutate({
                        id: user.id,
                        role: event.target.value as RoleUser,
                      })
                    }
                    className="bg-background h-9 rounded-md border px-3 text-sm"
                    disabled={changerRole.isPending}
                  >
                    {ROLE_VALUES.map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>

                  {user.est_actif ? (
                    <Button
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (
                          confirm(
                            `Voulez-vous vraiment désactiver le compte de ${user.name} ?`,
                          )
                        ) {
                          changerStatut.mutate({
                            id: user.id,
                            est_actif: false,
                          });
                        }
                      }}
                    >
                      <UserX className="mr-2 h-4 w-4" /> Bloquer
                    </Button>
                  ) : (
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        changerStatut.mutate({ id: user.id, est_actif: true })
                      }
                    >
                      <UserCheck className="mr-2 h-4 w-4" /> Réactiver
                    </Button>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-black">
          Gestion des utilisateurs
        </h1>
        <p className="text-muted-foreground">
          Gérez les accès, les comptes désactivés et les rôles back-office.
        </p>
      </div>

      <Tabs defaultValue="tous" className="w-full">
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 p-1 md:grid-cols-4">
          <TabsTrigger value="tous" className="py-2.5">
            <Users className="mr-2 h-4 w-4" /> Tous ({typedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="citoyens" className="py-2.5">
            Citoyens ({citoyens.length})
          </TabsTrigger>
          <TabsTrigger value="equipe" className="py-2.5">
            <Shield className="mr-2 h-4 w-4" /> Équipe ({equipe.length})
          </TabsTrigger>
          <TabsTrigger value="inactifs" className="py-2.5">
            <UserX className="mr-2 h-4 w-4" /> Bloqués ({inactifs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tous">{renderUsers(typedUsers)}</TabsContent>
        <TabsContent value="citoyens">{renderUsers(citoyens)}</TabsContent>
        <TabsContent value="equipe">{renderUsers(equipe)}</TabsContent>
        <TabsContent value="inactifs">{renderUsers(inactifs)}</TabsContent>
      </Tabs>
    </div>
  );
}
