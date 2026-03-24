import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.job.deleteMany();
  await db.lead.deleteMany();

  const leads = await Promise.all([
    db.lead.create({ data: { fullName: "Marcus Rivera", phone: "(555) 201-3388", email: "marcus@example.com", serviceType: "Full detail", source: "INSTAGRAM", status: "NEW", urgency: "HIGH", location: "Frisco, TX", estimatedCents: 18500, notes: "Wants weekend appointment.", nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 3) } }),
    db.lead.create({ data: { fullName: "Nina Brooks", phone: "(555) 774-1182", serviceType: "Interior detail", source: "GOOGLE", status: "QUOTED", urgency: "MEDIUM", location: "Plano, TX", estimatedCents: 14000, notes: "Sent quote, waiting on approval.", nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 24) } }),
    db.lead.create({ data: { fullName: "Ethan Cole", phone: "(555) 320-9011", serviceType: "Wash + wax", source: "REFERRAL", status: "BOOKED", urgency: "MEDIUM", location: "Dallas, TX", estimatedCents: 22000, notes: "Customer referred by Jake.", nextFollowUpAt: new Date(Date.now() + 1000 * 60 * 60 * 48) } }),
  ]);

  await Promise.all([
    db.job.create({ data: { title: "Rivera Escalade detail", serviceType: "Full detail", status: "QUOTED", scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 26), quotedCents: 18500, leadId: leads[0].id, address: "Frisco, TX" } }),
    db.job.create({ data: { title: "Cole Tesla wash + wax", serviceType: "Wash + wax", status: "SCHEDULED", scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 52), quotedCents: 22000, leadId: leads[2].id, address: "Dallas, TX" } }),
  ]);

  return NextResponse.json({ ok: true });
}
