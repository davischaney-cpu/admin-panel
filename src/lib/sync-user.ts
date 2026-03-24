import { auth, currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";

type SyncPayload = {
  clerkUserId: string;
  email: string;
  name?: string | null;
  role?: string | null;
};

function toRole(role?: string | null): Role {
  switch ((role ?? "").toLowerCase()) {
    case "owner":
      return Role.OWNER;
    case "admin":
      return Role.ADMIN;
    case "sales":
      return Role.SALES;
    case "ops":
      return Role.OPS;
    default:
      return Role.VIEWER;
  }
}

export async function syncUserToDatabase(payload: SyncPayload) {
  const role = toRole(payload.role);

  return db.user.upsert({
    where: { clerkUserId: payload.clerkUserId },
    update: {
      email: payload.email,
      name: payload.name || null,
      role,
    },
    create: {
      clerkUserId: payload.clerkUserId,
      email: payload.email,
      name: payload.name || null,
      role,
    },
  });
}

export async function syncCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress;

  if (!primaryEmail) {
    return null;
  }

  return syncUserToDatabase({
    clerkUserId: user.id,
    email: primaryEmail,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username,
    role: typeof user.publicMetadata?.role === "string" ? user.publicMetadata.role : null,
  });
}
