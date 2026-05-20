import { describe, expect, it } from "vitest";

import { ressourceSchema } from "./ressource";

describe("ressourceSchema", () => {
  it("valide une ressource complète", () => {
    const result = ressourceSchema.safeParse({
      titre: "Communication bienveillante",
      contenu: "Un contenu assez détaillé pour être utile aux citoyens.",
      visibilite: "PUBLIQUE",
      statut_publication: "EN_ATTENTE",
      categorie_id: "cat",
      type_relation_id: "relation",
      type_ressource_id: "type",
    });

    expect(result.success).toBe(true);
  });

  it("refuse un contenu trop court", () => {
    const result = ressourceSchema.safeParse({
      titre: "Ok",
      contenu: "Court",
      visibilite: "PUBLIQUE",
      statut_publication: "EN_ATTENTE",
      categorie_id: "",
      type_relation_id: "",
      type_ressource_id: "",
    });

    expect(result.success).toBe(false);
  });
});
