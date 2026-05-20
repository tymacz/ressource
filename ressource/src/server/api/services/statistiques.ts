import type {
  PrismaClient,
  TypeActionStats,
} from "../../../../generated/prisma";

type LogStatistiqueInput = {
  typeAction: TypeActionStats;
  utilisateurId?: string | null;
  ressourceId?: string | null;
  zoneGeographique?: string | null;
};

export async function logStatistique(
  db: PrismaClient,
  {
    typeAction,
    utilisateurId = null,
    ressourceId = null,
    zoneGeographique = null,
  }: LogStatistiqueInput,
) {
  await db.statistiqueLog.create({
    data: {
      type_action: typeAction,
      utilisateur_id: utilisateurId,
      ressource_id: ressourceId,
      zone_geographique: zoneGeographique,
    },
  });
}
