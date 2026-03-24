import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Canvas sync has been retired. This product is being rebuilt as DavyG CRM." },
    { status: 410 },
  );
}
