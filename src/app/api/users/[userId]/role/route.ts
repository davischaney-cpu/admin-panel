import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { APP_ROLES, normalizeRole } from "@/lib/permissions";
import { requirePermission } from "@/lib/require-permission";
import { getOwnerEmail, isOwnerEmail } from "@/lib/owner";

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const gate = await requirePermission("manageRoles");
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { userId } = await params;
  const body = await request.json() as { role?: string };
  let role = normalizeRole(body.role);

  if (!APP_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const ownerEmail = getOwnerEmail();

  if (isOwnerEmail(user.email)) {
    role = "OWNER";
  } else if (role === "OWNER") {
    return NextResponse.json({ error: ownerEmail ? `Only ${ownerEmail} can be the owner.` : "Only the configured owner email can be the owner." }, { status: 400 });
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { role },
  });

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.clerkUserId, {
      publicMetadata: {
        role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Database role updated, but Clerk metadata sync failed.",
        details: error instanceof Error ? error.message : "Unknown Clerk error",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, user: updatedUser });
}
