import { NextResponse } from "next/server";
import { createJobActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/require-permission";

const validStatuses = ["DRAFT", "QUOTED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
const validQuoteStatuses = ["DRAFT", "SENT", "APPROVED", "DECLINED"] as const;
const validInvoiceStatuses = ["NOT_SENT", "SENT", "PAID", "OVERDUE"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const gate = await requirePermission("editJobs");
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: gate.status });
  }

  const { jobId } = await params;
  const body = await request.json() as {
    title?: string;
    serviceType?: string;
    status?: string;
    quoteStatus?: string;
    invoiceStatus?: string;
    scheduledFor?: string | null;
    quotedCents?: number | null;
    finalCents?: number | null;
    address?: string | null;
    notes?: string | null;
  };

  const status = validStatuses.includes(body.status as (typeof validStatuses)[number]) ? body.status as (typeof validStatuses)[number] : undefined;
  const quoteStatus = validQuoteStatuses.includes(body.quoteStatus as (typeof validQuoteStatuses)[number]) ? body.quoteStatus as (typeof validQuoteStatuses)[number] : undefined;
  const invoiceStatus = validInvoiceStatuses.includes(body.invoiceStatus as (typeof validInvoiceStatuses)[number]) ? body.invoiceStatus as (typeof validInvoiceStatuses)[number] : undefined;

  const job = await db.job.update({
    where: { id: jobId },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.serviceType ? { serviceType: body.serviceType } : {}),
      ...(status ? { status } : {}),
      ...(quoteStatus ? { quoteStatus } : {}),
      ...(invoiceStatus ? { invoiceStatus } : {}),
      ...(body.scheduledFor !== undefined ? { scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null } : {}),
      ...(body.quotedCents !== undefined ? { quotedCents: body.quotedCents } : {}),
      ...(body.finalCents !== undefined ? { finalCents: body.finalCents } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      ...(quoteStatus === "SENT" ? { quotedAt: new Date() } : {}),
      ...(quoteStatus === "APPROVED" ? { quoteApprovedAt: new Date() } : {}),
      ...(invoiceStatus === "SENT" ? { invoiceSentAt: new Date() } : {}),
      ...(invoiceStatus === "PAID" ? { invoicePaidAt: new Date() } : {}),
    },
    include: { lead: true },
  });

  if (status) await createJobActivity(job.id, "job.status_changed", `Job status changed to ${status}`, { status });
  if (quoteStatus) await createJobActivity(job.id, "job.quote_status_changed", `Quote status changed to ${quoteStatus}`, { quoteStatus });
  if (invoiceStatus) await createJobActivity(job.id, "job.invoice_status_changed", `Invoice status changed to ${invoiceStatus}`, { invoiceStatus });
  if (body.scheduledFor !== undefined) await createJobActivity(job.id, "job.schedule_updated", body.scheduledFor ? "Job schedule updated" : "Job schedule cleared", { scheduledFor: body.scheduledFor });
  if (body.notes !== undefined) await createJobActivity(job.id, "job.notes_updated", "Job notes updated");

  return NextResponse.json({ ok: true, job });
}
