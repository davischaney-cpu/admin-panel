import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    leadId?: string;
    title?: string;
    serviceType?: string;
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
      status: "SCHEDULED",
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      quotedCents: typeof body.quotedCents === "number" ? body.quotedCents : null,
      address: body.address || null,
    },
    include: { lead: true },
  });

  if (body.leadId) {
    await db.lead.update({
      where: { id: body.leadId },
      data: { status: "BOOKED" },
    });
  }

  return NextResponse.json({ ok: true, job });
}
