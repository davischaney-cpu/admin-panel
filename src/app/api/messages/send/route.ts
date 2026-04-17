import { auth } from "@clerk/nextjs/server";
import { MessageChannel, MessageStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmailMessage, sendSmsMessage } from "@/lib/messaging";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) {
    return NextResponse.json({ error: "User record not found." }, { status: 403 });
  }

  const body = await request.json() as {
    leadId?: string | null;
    jobId?: string | null;
    channel?: MessageChannel;
    to?: string;
    subject?: string;
    body?: string;
  };

  if (!body.channel || !body.to || !body.body) {
    return NextResponse.json({ error: "channel, to, and body are required." }, { status: 400 });
  }

  if (body.channel === MessageChannel.EMAIL && !body.subject?.trim()) {
    return NextResponse.json({ error: "Email subject is required." }, { status: 400 });
  }

  const message = await db.message.create({
    data: {
      leadId: body.leadId ?? null,
      jobId: body.jobId ?? null,
      createdByUserId: user.id,
      channel: body.channel,
      to: body.to,
      subject: body.subject?.trim() || null,
      body: body.body,
      status: MessageStatus.PENDING,
    },
  });

  try {
    const delivery = body.channel === MessageChannel.EMAIL
      ? await sendEmailMessage({ to: body.to, subject: body.subject!.trim(), body: body.body })
      : await sendSmsMessage({ to: body.to, body: body.body });

    const updated = await db.message.update({
      where: { id: message.id },
      data: {
        status: MessageStatus.SENT,
        providerId: delivery.providerId,
        from: delivery.from,
        sentAt: new Date(),
      },
    });

    await db.activityEvent.create({
      data: {
        leadId: body.leadId ?? null,
        jobId: body.jobId ?? null,
        kind: body.channel === MessageChannel.EMAIL ? "EMAIL_SENT" : "SMS_SENT",
        message: `${body.channel === MessageChannel.EMAIL ? "Email" : "SMS"} sent to ${body.to}`,
        metadata: { messageId: updated.id, subject: updated.subject },
      },
    });

    return NextResponse.json({ ok: true, message: updated });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Could not send message.";

    await db.message.update({
      where: { id: message.id },
      data: {
        status: MessageStatus.FAILED,
        error: messageText,
      },
    });

    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
