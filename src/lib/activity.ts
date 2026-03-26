import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function createLeadActivity(leadId: string, kind: string, message: string, metadata?: Prisma.InputJsonValue) {
  return db.activityEvent.create({
    data: {
      leadId,
      kind,
      message,
      metadata,
    },
  });
}

export async function createJobActivity(jobId: string, kind: string, message: string, metadata?: Prisma.InputJsonValue) {
  return db.activityEvent.create({
    data: {
      jobId,
      kind,
      message,
      metadata,
    },
  });
}
