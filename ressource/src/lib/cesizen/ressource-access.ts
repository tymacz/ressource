import { canModerate, type RoleUser } from "@/lib/auth/roles";

export type Visibilite = "PUBLIQUE" | "PARTAGEE" | "PRIVEE";
export type StatutPublication =
  | "BROUILLON"
  | "EN_ATTENTE"
  | "VALIDEE"
  | "SUSPENDUE";

type LectureInput = {
  auteurId: string;
  statutPublication: StatutPublication;
  visibilite: Visibilite;
  viewerId?: string | null;
  viewerRole?: RoleUser | null;
};

export function getVisibilitesConsultables(
  utilisateurConnecte: boolean,
): Visibilite[] {
  return utilisateurConnecte ? ["PUBLIQUE", "PARTAGEE"] : ["PUBLIQUE"];
}

export function getStatutInitialPublication(
  visibilite: Visibilite,
): StatutPublication {
  return visibilite === "PUBLIQUE" ? "EN_ATTENTE" : "VALIDEE";
}

export function peutConsulterRessource({
  auteurId,
  statutPublication,
  visibilite,
  viewerId,
  viewerRole,
}: LectureInput): boolean {
  if (canModerate(viewerRole)) return true;
  if (viewerId === auteurId) return true;
  if (statutPublication !== "VALIDEE") return false;
  if (visibilite === "PUBLIQUE") return true;
  return visibilite === "PARTAGEE" && Boolean(viewerId);
}
