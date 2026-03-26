import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/require-permission";

export async function POST(request: Request) {
  const gate = await requirePermission("createJobs");
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const body = await request.json() as {
    leadId?: string;
    title?: string;
    serviceType?: string;
    status?: string;
    quoteStatus?: string;
    scheduledFor?: string | null;
    quotedCents?: number | null;
    address?: string;
  };

  if (!body.title || !body.serviceType) {
    return NextResponse.json({ error: "Title and service type are required." }, { status: 400 });
  }

  const job = await db.job.create({
    data: {
      leadId: body.leadId || null,
      title: body.title,
      serviceType: body.serviceType,
      status: body.status === "DRAFT" || body.status === "QUOTED" || body.status === "IN_PROGRESS" || body.status === "COMPLETED" || body.status === "CANCELLED" ? body.status : "SCHEDULED",
      quoteStatus: body.quoteStatus === "SENT" || body.quoteStatus === "APPROVED" || body.quoteStatus === "DECLINED" ? body.quoteStatus : "DRAFT",
      quotedAt: body.quoteStatus === "SENT" || body.quoteStatus === "APPROVED" ? new Date() : null,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      quotedCents: typeof body.quotedCents === "number" ? body.quotedCents : null,
      address: body.address || null,
    },
    include: { lead: true },
  });

  if (body.leadId) {
    await db.lead.update({
      where: { id: body.leadId },
      data: { status: body.status === "QUOTED" ? "QUOTED" : "BOOKED" },
    });
  }

  return NextResponse.json({ ok: true, job });
}
