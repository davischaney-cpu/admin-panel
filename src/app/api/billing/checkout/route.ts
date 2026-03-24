import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { plan?: string };

  return NextResponse.json({
    ok: false,
    plan: body.plan ?? null,
    message: "Stripe checkout is scaffolded, but live checkout needs STRIPE_SECRET_KEY and price IDs configured.",
  }, { status: 501 });
}
