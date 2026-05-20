"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

type FormState = {
  titre: string;
  contenu: string;
  categorie_id: string;
  type_relation_id: string;
  type_ressource_id: string;
  visibilite: "PUBLIQUE" | "PARTAGEE" | "PRIVEE";
  statut_publication: "BROUILLON" | "EN_ATTENTE" | "VALIDEE" | "SUSPENDUE";
};

const emptyForm: FormState = {
  titre: "",
  contenu: "",
  categorie_id: "",
  type_relation_id: "",
  type_ressource_id: "",
  visibilite: "PUBLIQUE",
  statut_publication: "EN_ATTENTE",
};

export default function ModifierRessourceAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: ressource, isLoading } = api.admin.getRessourceById.useQuery({
    id,
  });
  const { data: categories } = api.ressource.getCategories.useQuery();
  const { data: typesRelation } = api.ressource.getTypesRelation.useQuery();
  const { data: typesRessource } = api.ressource.getTypesRessource.useQuery();

  useEffect(() => {
    if (!ressource) return;

    setForm({
      titre: ressource.titre,
      contenu: ressource.contenu,
      categorie_id: ressource.categorie_id,
      type_relation_id: ressource.type_relation_id,
      type_ressource_id: ressource.type_ressource_id,
      visibilite: ressource.visibilite,
      statut_publication: ressource.statut_publication,
    });
  }, [ressource]);

  const modifier = api.admin.modifierRessource.useMutation({
    onSuccess: () => {
      toast.success("Ressource mise à jour.");
      router.push("/admin/ressources");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.categorie_id ||
      !form.type_relation_id ||
      !form.type_ressource_id
    ) {
      toast.error("Tous les référentiels doivent être renseignés.");
      return;
    }

    modifier.mutate({ id, ...form });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ressource) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold">Ressource introuvable</h1>
        <Button asChild>
          <Link href="/admin/ressources">Retour à la modération</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/admin/ressources">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la modération
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Modifier une ressource</CardTitle>
          <CardDescription>
            Ajustez le contenu, le classement et l’état de publication visible
            dans CESIZen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="titre" className="text-sm font-medium">
                Titre
              </label>
              <Input
                id="titre"
                value={form.titre}
                minLength={3}
                onChange={(event) => updateField("titre", event.target.value)}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="categorie" className="text-sm font-medium">
                  Catégorie
                </label>
                <Select
                  value={form.categorie_id}
                  onValueChange={(value) => updateField("categorie_id", value)}
                >
                  <SelectTrigger id="categorie">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((categorie) => (
                      <SelectItem key={categorie.id} value={categorie.id}>
                        {categorie.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="typeRelation" className="text-sm font-medium">
                  Public ou contexte
                </label>
                <Select
                  value={form.type_relation_id}
                  onValueChange={(value) =>
                    updateField("type_relation_id", value)
                  }
                >
                  <SelectTrigger id="typeRelation">
                    <SelectValue placeholder="Choisir un contexte" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesRelation?.map((typeRelation) => (
                      <SelectItem key={typeRelation.id} value={typeRelation.id}>
                        {typeRelation.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="typeRessource" className="text-sm font-medium">
                  Format
                </label>
                <Select
                  value={form.type_ressource_id}
                  onValueChange={(value) =>
                    updateField("type_ressource_id", value)
                  }
                >
                  <SelectTrigger id="typeRessource">
                    <SelectValue placeholder="Choisir un format" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesRessource?.map((typeRessource) => (
                      <SelectItem
                        key={typeRessource.id}
                        value={typeRessource.id}
                      >
                        {typeRessource.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="visibilite" className="text-sm font-medium">
                  Visibilité
                </label>
                <Select
                  value={form.visibilite}
                  onValueChange={(value: FormState["visibilite"]) =>
                    updateField("visibilite", value)
                  }
                >
                  <SelectTrigger id="visibilite">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIQUE">Publique</SelectItem>
                    <SelectItem value="PARTAGEE">Partagée</SelectItem>
                    <SelectItem value="PRIVEE">Privée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="statut" className="text-sm font-medium">
                  Statut
                </label>
                <Select
                  value={form.statut_publication}
                  onValueChange={(value: FormState["statut_publication"]) =>
                    updateField("statut_publication", value)
                  }
                >
                  <SelectTrigger id="statut">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BROUILLON">Brouillon</SelectItem>
                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                    <SelectItem value="VALIDEE">Validée</SelectItem>
                    <SelectItem value="SUSPENDUE">Suspendue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="contenu" className="text-sm font-medium">
                Contenu
              </label>
              <Textarea
                id="contenu"
                value={form.contenu}
                minLength={10}
                onChange={(event) => updateField("contenu", event.target.value)}
                className="min-h-60"
                required
              />
            </div>

            <Button type="submit" disabled={modifier.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {modifier.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
