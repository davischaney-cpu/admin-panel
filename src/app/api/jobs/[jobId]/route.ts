import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/require-permission";

const validStatuses = ["DRAFT", "QUOTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const gate = await requirePermission("editJobs");
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { jobId } = await params;
  const body = await request.json() as {
    title?: string;
    serviceType?: string;
    status?: string;
    scheduledFor?: string | null;
    quotedCents?: number | null;
    finalCents?: number | null;
    address?: string | null;
    notes?: string | null;
  };

  const status = validStatuses.includes(body.status as (typeof validStatuses)[number]) ? body.status as (typeof validStatuses)[number] : undefined;

  const lead = await db.job.update({
    where: { id: jobId },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.serviceType ? { serviceType: body.serviceType } : {}),
      ...(status ? { status } : {}),
      ...(body.scheduledFor !== undefined ? { scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null } : {}),
      ...(body.quotedCents !== undefined ? { quotedCents: body.quotedCents } : {}),
      ...(body.finalCents !== undefined ? { finalCents: body.finalCents } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
    },
    include: { lead: true },
  });

  return NextResponse.json({ ok: true, lead });
}
