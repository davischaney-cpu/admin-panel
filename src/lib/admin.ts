import { auth } from "@clerk/nextjs/server";

export async function getAdminContext() {
  const { userId, sessionClaims } = await auth();
  const metadata = typeof sessionClaims?.metadata === "object" && sessionClaims?.metadata ? sessionClaims.metadata as Record<string, unknown> : null;
  const publicMetadata = typeof metadata?.public === "object" && metadata.public ? metadata.public as Record<string, unknown> : null;
  const role = typeof publicMetadata?.role === "string" ? publicMetadata.role : null;
  const email = typeof sessionClaims?.email === "string" ? sessionClaims.email : null;

  return {
    userId,
    email,
    role,
    isAdmin: role === "admin",
  };
}
