import { describe, expect, it } from "vitest";

import {
  getStatutInitialPublication,
  getVisibilitesConsultables,
  peutConsulterRessource,
} from "./ressource-access";

describe("ressource-access", () => {
  it("limite les ressources partagées aux utilisateurs connectés", () => {
    expect(getVisibilitesConsultables(false)).toEqual(["PUBLIQUE"]);
    expect(getVisibilitesConsultables(true)).toEqual(["PUBLIQUE", "PARTAGEE"]);
  });

  it("soumet les ressources publiques citoyennes à validation", () => {
    expect(getStatutInitialPublication("PUBLIQUE")).toBe("EN_ATTENTE");
    expect(getStatutInitialPublication("PRIVEE")).toBe("VALIDEE");
  });

  it("protège les brouillons et ressources privées", () => {
    expect(
      peutConsulterRessource({
        auteurId: "auteur",
        statutPublication: "BROUILLON",
        visibilite: "PRIVEE",
        viewerId: "autre",
        viewerRole: "CITOYEN",
      }),
    ).toBe(false);

    expect(
      peutConsulterRessource({
        auteurId: "auteur",
        statutPublication: "BROUILLON",
        visibilite: "PRIVEE",
        viewerId: "moderateur",
        viewerRole: "MODERATEUR",
      }),
    ).toBe(true);
  });
});
