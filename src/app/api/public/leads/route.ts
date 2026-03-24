import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json() as {
    fullName?: string;
    phone?: string;
    email?: string;
    serviceType?: string;
    location?: string;
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
      source: "WEBSITE",
      status: "NEW",
      location: body.location || null,
      notes: body.notes || null,
      nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
    },
  });

  return NextResponse.json({ ok: true, lead });
}
