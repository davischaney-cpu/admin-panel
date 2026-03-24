import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const validStatuses = ["NEW", "CONTACTED", "QUOTED", "BOOKED", "COMPLETED", "LOST"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
