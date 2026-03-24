import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    fullName?: string;
    phone?: string;
    email?: string;
    serviceType?: string;
    source?: string;
    location?: string;
    estimatedCents?: number | null;
    notes?: string;
  };

  if (!body.fullName || !body.serviceType) {
    return NextResponse.json({ error: "Name and service type are required." }, { status: 400 });
  }

  const lead = await db.lead.create({
    data: {
      fullName: body.fullName,
      phone: body.phone || null,
      email: body.email || null,
      serviceType: body.serviceType,
      source: body.source === "INSTAGRAM" || body.source === "FACEBOOK" || body.source === "GOOGLE" || body.source === "REFERRAL" || body.source === "PHONE" ? body.source : "WEBSITE",
      location: body.location || null,
      estimatedCents: typeof body.estimatedCents === "number" ? body.estimatedCents : null,
      notes: body.notes || null,
      nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return NextResponse.json({ ok: true, lead });
}
