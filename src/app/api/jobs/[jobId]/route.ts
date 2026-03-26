import { NextResponse } from "next/server";
import { createJobActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { calculateQuoteTotals } from "@/lib/quote";
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
    quoteTaxCents?: number | null;
    quoteDiscountCents?: number | null;
    quoteItems?: Array<{ id?: string; label: string; description?: string | null; quantity: number; unitCents: number; position: number }>;
    address?: string | null;
    notes?: string | null;
  };

  const status = validStatuses.includes(body.status as (typeof validStatuses)[number]) ? body.status as (typeof validStatuses)[number] : undefined;
  const quoteStatus = validQuoteStatuses.includes(body.quoteStatus as (typeof validQuoteStatuses)[number]) ? body.quoteStatus as (typeof validQuoteStatuses)[number] : undefined;
  const invoiceStatus = validInvoiceStatuses.includes(body.invoiceStatus as (typeof validInvoiceStatuses)[number]) ? body.invoiceStatus as (typeof validInvoiceStatuses)[number] : undefined;
  const taxCents = body.quoteTaxCents ?? undefined;
  const discountCents = body.quoteDiscountCents ?? undefined;
  const quoteTotals = body.quoteItems ? calculateQuoteTotals(body.quoteItems, body.quoteTaxCents ?? 0, body.quoteDiscountCents ?? 0) : undefined;

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
      ...(taxCents !== undefined ? { quoteTaxCents: taxCents } : {}),
      ...(discountCents !== undefined ? { quoteDiscountCents: discountCents } : {}),
      ...(quoteTotals ? { quoteSubtotalCents: quoteTotals.subtotalCents, quoteTotalCents: quoteTotals.totalCents, quotedCents: quoteTotals.totalCents } : {}),
      ...(body.quoteItems ? {
        quoteItems: {
          deleteMany: {},
          create: body.quoteItems.map((item) => ({
            label: item.label,
            description: item.description || null,
            quantity: item.quantity,
            unitCents: item.unitCents,
            position: item.position,
          })),
        },
      } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      ...(quoteStatus === "SENT" ? { quotedAt: new Date() } : {}),
      ...(quoteStatus === "APPROVED" ? { quoteApprovedAt: new Date() } : {}),
      ...(invoiceStatus === "SENT" ? { invoiceSentAt: new Date() } : {}),
      ...(invoiceStatus === "PAID" ? { invoicePaidAt: new Date() } : {}),
    },
    include: { lead: true, quoteItems: { orderBy: { position: "asc" } } },
  });

  if (status) await createJobActivity(job.id, "job.status_changed", `Job status changed to ${status}`, { status });
  if (quoteStatus) await createJobActivity(job.id, "job.quote_status_changed", `Quote status changed to ${quoteStatus}`, { quoteStatus });
  if (invoiceStatus) await createJobActivity(job.id, "job.invoice_status_changed", `Invoice status changed to ${invoiceStatus}`, { invoiceStatus });
  if (body.scheduledFor !== undefined) await createJobActivity(job.id, "job.schedule_updated", body.scheduledFor ? "Job schedule updated" : "Job schedule cleared", { scheduledFor: body.scheduledFor });
  if (body.notes !== undefined) await createJobActivity(job.id, "job.notes_updated", "Job notes updated");
  if (body.quoteItems) await createJobActivity(job.id, "job.quote_updated", "Quote line items updated", { itemCount: body.quoteItems.length, totalCents: quoteTotals?.totalCents ?? null });

  return NextResponse.json({ ok: true, job });
}
