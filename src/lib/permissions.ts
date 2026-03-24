export const APP_ROLES = ["OWNER", "ADMIN", "SALES", "OPS", "VIEWER"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export type Permission =
  | "viewDashboard"
  | "viewLeads"
  | "createLeads"
  | "editLeads"
  | "convertLeads"
  | "viewJobs"
  | "createJobs"
  | "editJobs"
  | "editJobPricing"
  | "viewCalendar"
  | "manageUsers"
  | "manageRoles"
  | "manageBilling"
  | "manageNotifications"
  | "useDemoTools";

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  OWNER: [
    "viewDashboard",
    "viewLeads",
    "createLeads",
    "editLeads",
    "convertLeads",
    "viewJobs",
    "createJobs",
    "editJobs",
    "editJobPricing",
    "viewCalendar",
    "manageUsers",
    "manageRoles",
    "manageBilling",
    "manageNotifications",
    "useDemoTools",
  ],
  ADMIN: [
    "viewDashboard",
    "viewLeads",
    "createLeads",
    "editLeads",
    "convertLeads",
    "viewJobs",
    "createJobs",
    "editJobs",
    "editJobPricing",
    "viewCalendar",
    "manageUsers",
    "manageRoles",
    "manageNotifications",
    "useDemoTools",
  ],
  SALES: [
    "viewDashboard",
    "viewLeads",
    "createLeads",
    "editLeads",
    "convertLeads",
    "viewJobs",
    "createJobs",
    "viewCalendar",
  ],
  OPS: [
    "viewDashboard",
    "viewLeads",
    "viewJobs",
    "createJobs",
    "editJobs",
    "viewCalendar",
  ],
  VIEWER: ["viewDashboard", "viewLeads", "viewJobs", "viewCalendar"],
};

export function normalizeRole(role?: string | null): AppRole {
  if (!role) return "VIEWER";
  const upper = role.toUpperCase();
  return (APP_ROLES as readonly string[]).includes(upper) ? (upper as AppRole) : "VIEWER";
}

export function hasPermission(role: string | null | undefined, permission: Permission) {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized].includes(permission);
}

export function getRolePermissions(role: string | null | undefined) {
  return ROLE_PERMISSIONS[normalizeRole(role)];
}
