import { describe, expect, it } from "vitest";

import {
  canManageCatalogue,
  canManageUsers,
  canModerate,
  getRoleLabel,
  isStaffRole,
} from "./roles";

describe("roles", () => {
  it("identifie les rôles back-office", () => {
    expect(isStaffRole("CITOYEN")).toBe(false);
    expect(isStaffRole("MODERATEUR")).toBe(true);
    expect(isStaffRole("ADMIN_CATALOGUE")).toBe(true);
    expect(isStaffRole("SUPER_ADMIN")).toBe(true);
  });

  it("applique les permissions par rôle", () => {
    expect(canModerate("MODERATEUR")).toBe(true);
    expect(canManageCatalogue("MODERATEUR")).toBe(false);
    expect(canManageCatalogue("ADMIN_CATALOGUE")).toBe(true);
    expect(canManageUsers("ADMIN_CATALOGUE")).toBe(false);
    expect(canManageUsers("SUPER_ADMIN")).toBe(true);
  });

  it("retourne un libellé lisible", () => {
    expect(getRoleLabel("SUPER_ADMIN")).toBe("Super-administrateur");
    expect(getRoleLabel("ROLE_INCONNU")).toBe("Citoyen");
  });
});
