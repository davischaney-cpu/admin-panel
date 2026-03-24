import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/require-permission";

const validStatuses = ["NEW", "CONTACTED", "QUOTED", "BOOKED", "COMPLETED", "LOST"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const gate = await requirePermission("editLeads");
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { leadId } = await params;
  const body = await request.json() as {
    status?: string;
    nextFollowUpAt?: string | null;
  };

  const status = validStatuses.includes(body.status as (typeof validStatuses)[number]) ? body.status as (typeof validStatuses)[number] : undefined;
  const nextFollowUpAt = body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : body.nextFollowUpAt === null ? null : undefined;

  const lead = await db.lead.update({
    where: { id: leadId },
    data: {
      ...(status ? { status } : {}),
      ...(nextFollowUpAt !== undefined ? { nextFollowUpAt } : {}),
      ...(status === "CONTACTED" ? { lastContactedAt: new Date() } : {}),
    },
  });

  return NextResponse.json({ ok: true, lead });
}
