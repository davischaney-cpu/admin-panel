import { Role } from "@prisma/client";
import { db } from "@/lib/db";

type SyncUserInput = {
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

export async function syncUserToDatabase(input: SyncUserInput) {
  return db.user.upsert({
    where: { clerkUserId: input.clerkUserId },
    update: {
      email: input.email,
      name: input.name ?? null,
      role: toRole(input.role),
    },
    create: {
      clerkUserId: input.clerkUserId,
      email: input.email,
      name: input.name ?? null,
      role: toRole(input.role),
    },
  });
}
