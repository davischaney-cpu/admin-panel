-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('NOT_SENT', 'SENT', 'PAID', 'OVERDUE');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "invoicePaidAt" TIMESTAMP(3),
ADD COLUMN     "invoiceSentAt" TIMESTAMP(3),
ADD COLUMN     "invoiceStatus" "InvoiceStatus" NOT NULL DEFAULT 'NOT_SENT',
ADD COLUMN     "quoteApprovedAt" TIMESTAMP(3),
ADD COLUMN     "quoteStatus" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "quotedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Job_quoteStatus_idx" ON "Job"("quoteStatus");

-- CreateIndex
CREATE INDEX "Job_invoiceStatus_idx" ON "Job"("invoiceStatus");
