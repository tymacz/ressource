export const ROLE_VALUES = [
  "CITOYEN",
  "MODERATEUR",
  "ADMIN_CATALOGUE",
  "SUPER_ADMIN",
] as const;

export type RoleUser = (typeof ROLE_VALUES)[number];

export const ROLE_LABELS: Record<RoleUser, string> = {
  CITOYEN: "Citoyen",
  MODERATEUR: "Modérateur",
  ADMIN_CATALOGUE: "Administrateur catalogue",
  SUPER_ADMIN: "Super-administrateur",
};

export function isRole(value: unknown): value is RoleUser {
  return typeof value === "string" && ROLE_VALUES.includes(value as RoleUser);
}

export function getRoleLabel(role: string | null | undefined): string {
  return isRole(role) ? ROLE_LABELS[role] : "Citoyen";
}

export function isStaffRole(role: string | null | undefined): boolean {
  return (
    role === "MODERATEUR" ||
    role === "ADMIN_CATALOGUE" ||
    role === "SUPER_ADMIN"
  );
}

export function canModerate(role: string | null | undefined): boolean {
  return (
    role === "MODERATEUR" ||
    role === "ADMIN_CATALOGUE" ||
    role === "SUPER_ADMIN"
  );
}

export function canManageCatalogue(role: string | null | undefined): boolean {
  return role === "ADMIN_CATALOGUE" || role === "SUPER_ADMIN";
}

export function canManageUsers(role: string | null | undefined): boolean {
  return role === "SUPER_ADMIN";
}
