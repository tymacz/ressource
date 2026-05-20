"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  Download,
  Eye,
  Hammer,
  PenTool,
  Search,
  Share2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

const ALL_VALUE = "tous";

export default function StatistiquesPage() {
  const [periodeDu, setPeriodeDu] = useState("");
  const [periodeAu, setPeriodeAu] = useState("");
  const [categorieId, setCategorieId] = useState<string | undefined>();
  const [typeRelationId, setTypeRelationId] = useState<string | undefined>();
  const [typeRessourceId, setTypeRessourceId] = useState<string | undefined>();

  const { data: categories } = api.ressource.getCategories.useQuery();
  const { data: typesRelation } = api.ressource.getTypesRelation.useQuery();
  const { data: typesRessource } = api.ressource.getTypesRessource.useQuery();

  const { data: stats, isLoading } = api.admin.getStatistiques.useQuery({
    periodeDu: periodeDu || undefined,
    periodeAu: periodeAu || undefined,
    categorieId,
    typeRelationId,
    typeRessourceId,
  });

  const handleExportCSV = () => {
    if (!stats || stats.derniersLogs.length === 0) return;

    const headers =
      "Date,Type Action,Utilisateur,Ressource,Catégorie,Relation,Type\n";

    const rows = stats.derniersLogs
      .map((log) => {
        const date = format(new Date(log.date_action), "dd/MM/yyyy HH:mm");
        const user = log.user?.name ?? "Anonyme";
        const ressource = log.ressource?.titre?.replace(/,/g, " ") ?? "N/A";
        const categorie =
          log.ressource?.categorie?.libelle?.replace(/,/g, " ") ?? "N/A";
        const relation =
          log.ressource?.type_relation?.libelle?.replace(/,/g, " ") ?? "N/A";
        const type =
          log.ressource?.type_ressource?.libelle?.replace(/,/g, " ") ?? "N/A";

        return `${date},${log.type_action},${user},${ressource},${categorie},${relation},${type}`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `statistiques_ressources_${format(new Date(), "yyyyMMdd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toOptionalValue = (value: string) =>
    value === ALL_VALUE ? undefined : value;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-100 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black">Statistiques</h1>
          <p className="text-muted-foreground">
            Analysez l&apos;engagement des citoyens sur votre plateforme.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" /> Exporter en CSV
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5">
          <Input
            type="date"
            value={periodeDu}
            onChange={(event) => setPeriodeDu(event.target.value)}
            aria-label="Date de début"
          />
          <Input
            type="date"
            value={periodeAu}
            onChange={(event) => setPeriodeAu(event.target.value)}
            aria-label="Date de fin"
          />
          <Select
            value={categorieId ?? ALL_VALUE}
            onValueChange={(value) => setCategorieId(toOptionalValue(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Toutes les catégories</SelectItem>
              {(categories ?? []).map((categorie) => (
                <SelectItem key={categorie.id} value={categorie.id}>
                  {categorie.libelle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={typeRelationId ?? ALL_VALUE}
            onValueChange={(value) => setTypeRelationId(toOptionalValue(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Relation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Toutes les relations</SelectItem>
              {(typesRelation ?? []).map((typeRelation) => (
                <SelectItem key={typeRelation.id} value={typeRelation.id}>
                  {typeRelation.libelle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={typeRessourceId ?? ALL_VALUE}
            onValueChange={(value) =>
              setTypeRessourceId(toOptionalValue(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Tous les types</SelectItem>
              {(typesRessource ?? []).map((typeRessource) => (
                <SelectItem key={typeRessource.id} value={typeRessource.id}>
                  {typeRessource.libelle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard
          label="Vues"
          value={stats.compteParType.CONSULTATION}
          icon={Eye}
        />
        <StatCard
          label="Recherches"
          value={stats.compteParType.RECHERCHE}
          icon={Search}
        />
        <StatCard
          label="Créations"
          value={stats.compteParType.CREATION}
          icon={PenTool}
        />
        <StatCard
          label="Exploitations"
          value={stats.compteParType.EXPLOITATION}
          icon={Hammer}
        />
        <StatCard
          label="Partages"
          value={stats.compteParType.PARTAGE}
          icon={Share2}
        />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" /> Activités récentes (
            {stats.derniersLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.derniersLogs.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center">
              Aucune donnée statistique enregistrée pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Utilisateur</th>
                    <th className="px-6 py-3 font-medium">Ressource</th>
                  </tr>
                </thead>
                <tbody className="divide-border/50 divide-y">
                  {stats.derniersLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(
                          new Date(log.date_action),
                          "dd/MM/yyyy à HH:mm",
                          {
                            locale: fr,
                          },
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{log.type_action}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {log.user?.name ?? (
                          <span className="text-muted-foreground italic">
                            Anonyme
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.ressource?.titre ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
};

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">{label}</p>
          <Icon className="text-muted-foreground h-4 w-4" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
