"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  ressourceSchema,
  type RessourceFormValues,
} from "@/lib/validations/ressource";
import { api } from "@/trpc/react";

interface SelectOption {
  id: string;
  libelle: string;
}

interface RessourceFormProps {
  categories: SelectOption[];
  typeRelations: SelectOption[];
  typeRessources: SelectOption[];
}

export function RessourceForm({
  categories,
  typeRelations,
  typeRessources,
}: RessourceFormProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const createRessource = api.ressource.create.useMutation({
    onSuccess: async () => {
      await utils.progression.getMonTableauDeBord.invalidate();
      toast.success("Ressource publiée avec succès !");
      router.push("/tableau-de-bord");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RessourceFormValues>({
    resolver: zodResolver(ressourceSchema),
    defaultValues: {
      visibilite: "PRIVEE",
      statut_publication: "BROUILLON",
    },
  });

  const onSubmit = (data: RessourceFormValues) => {
    createRessource.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-border space-y-8 rounded-2xl border p-8 shadow-sm"
    >
      <div className="space-y-2">
        <h2 className="text-primary text-3xl font-bold tracking-tight">
          Nouvelle ressource
        </h2>
        <p className="text-muted-foreground font-medium">
          Partagez votre savoir avec la communauté (RE)Sources.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="titre"
            className="text-primary px-1 text-sm font-bold"
          >
            Titre
          </label>
          <input
            id="titre"
            {...register("titre")}
            className="bg-brand-ivory/40 placeholder:text-muted-foreground/50 focus:ring-brand-coral rounded-2xl p-4 transition-all outline-none focus:ring-2"
            placeholder="Quel est le sujet principal ?"
          />
          {errors.titre && (
            <p className="text-destructive px-1 text-xs font-bold">
              {errors.titre.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contenu"
            className="text-primary px-1 text-sm font-bold"
          >
            Contenu
          </label>
          <textarea
            id="contenu"
            rows={6}
            {...register("contenu")}
            className="bg-brand-ivory/40 focus:ring-brand-coral resize-none rounded-2xl p-4 transition-all outline-none focus:ring-2"
            placeholder="Développez votre pensée ici..."
          />
          {errors.contenu && (
            <p className="text-destructive px-1 text-xs font-bold">
              {errors.contenu.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="categorie_id"
              className="text-primary px-1 text-sm font-bold"
            >
              Catégorie
            </label>
            <select
              id="categorie_id"
              {...register("categorie_id")}
              className="bg-brand-ivory/40 focus:ring-brand-coral rounded-xl p-3 font-medium outline-none focus:ring-2"
            >
              <option value="">Choisir...</option>
              {categories.map((categorie) => (
                <option key={categorie.id} value={categorie.id}>
                  {categorie.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="type_relation_id"
              className="text-primary px-1 text-sm font-bold"
            >
              Relation
            </label>
            <select
              id="type_relation_id"
              {...register("type_relation_id")}
              className="bg-brand-ivory/40 focus:ring-brand-coral rounded-xl p-3 font-medium outline-none focus:ring-2"
            >
              <option value="">Choisir...</option>
              {typeRelations.map((typeRelation) => (
                <option key={typeRelation.id} value={typeRelation.id}>
                  {typeRelation.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="type_ressource_id"
              className="text-primary px-1 text-sm font-bold"
            >
              Type
            </label>
            <select
              id="type_ressource_id"
              {...register("type_ressource_id")}
              className="bg-brand-ivory/40 focus:ring-brand-coral rounded-xl p-3 font-medium outline-none focus:ring-2"
            >
              <option value="">Choisir...</option>
              {typeRessources.map((typeRessource) => (
                <option key={typeRessource.id} value={typeRessource.id}>
                  {typeRessource.libelle}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-brand-seafoam/20 bg-brand-seafoam/10 flex items-center justify-between rounded-2xl border p-4">
          <label htmlFor="visibilite" className="text-primary font-bold">
            Qui peut voir ceci ?
          </label>
          <select
            id="visibilite"
            {...register("visibilite")}
            className="text-primary rounded-lg bg-white p-2 text-sm font-bold shadow-sm"
          >
            <option value="PRIVEE">Privé</option>
            <option value="PARTAGEE">Partagé</option>
            <option value="PUBLIQUE">Public</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || createRessource.isPending}
        className="bg-brand-coral shadow-brand-coral/20 hover:bg-accessible-darkCoral w-full rounded-full py-4 font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
      >
        {isSubmitting || createRessource.isPending
          ? "Création en cours..."
          : "Publier la ressource"}
      </button>
    </form>
  );
}
