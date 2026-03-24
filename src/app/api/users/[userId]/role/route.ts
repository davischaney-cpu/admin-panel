import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { APP_ROLES, normalizeRole } from "@/lib/permissions";
import { requirePermission } from "@/lib/require-permission";

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const gate = await requirePermission("manageRoles");
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { userId } = await params;
  const body = await request.json() as { role?: string };
  const role = normalizeRole(body.role);

  if (!APP_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({ ok: true, user });
}
