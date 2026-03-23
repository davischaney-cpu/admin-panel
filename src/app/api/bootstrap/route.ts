import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncUserToDatabase } from "@/lib/sync-user";

export async function POST() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "No primary email found" }, { status: 400 });
  }

  const record = await syncUserToDatabase({
    clerkUserId: user.id,
    email,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username,
    role: typeof user.publicMetadata.role === "string" ? user.publicMetadata.role : null,
  });

  return NextResponse.json({ ok: true, user: record });
}
