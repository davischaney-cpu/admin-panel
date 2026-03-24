import { auth, currentUser } from "@clerk/nextjs/server";
import { hasPermission, normalizeRole } from "@/lib/permissions";

export async function getAdminContext() {
  const { userId, sessionClaims } = await auth();
  const metadata = typeof sessionClaims?.metadata === "object" && sessionClaims?.metadata
    ? sessionClaims.metadata as Record<string, unknown>
    : null;
  const publicMetadata = typeof metadata?.public === "object" && metadata.public
    ? metadata.public as Record<string, unknown>
    : null;

  let role = typeof publicMetadata?.role === "string" ? publicMetadata.role : null;
  let email = typeof sessionClaims?.email === "string" ? sessionClaims.email : null;

  if (userId && (!role || !email)) {
    const user = await currentUser();
    role = role ?? (typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : null);
    email = email ?? user?.primaryEmailAddress?.emailAddress ?? null;
  }

  const normalizedRole = normalizeRole(role);

  return {
    userId,
    email,
    role: normalizedRole,
    isAdmin: hasPermission(normalizedRole, "viewDashboard"),
    hasPermission: (permission: Parameters<typeof hasPermission>[1]) => hasPermission(normalizedRole, permission),
  };
}
