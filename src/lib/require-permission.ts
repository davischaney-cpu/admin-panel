import { auth, currentUser } from "@clerk/nextjs/server";
import { hasPermission, normalizeRole, type Permission } from "@/lib/permissions";

export async function requirePermission(permission: Permission) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  const metadata = typeof sessionClaims?.metadata === "object" && sessionClaims?.metadata
    ? sessionClaims.metadata as Record<string, unknown>
    : null;
  const publicMetadata = typeof metadata?.public === "object" && metadata.public
    ? metadata.public as Record<string, unknown>
    : null;

  let role = typeof publicMetadata?.role === "string" ? publicMetadata.role : null;

  if (!role) {
    const user = await currentUser();
    role = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : null;
  }

  const normalizedRole = normalizeRole(role);
  if (!hasPermission(normalizedRole, permission)) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, userId, role: normalizedRole };
}
