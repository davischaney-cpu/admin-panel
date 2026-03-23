-- CreateTable
CREATE TABLE "CanvasCourse" (
    "id" TEXT NOT NULL,
    "canvasCourseId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "courseCode" TEXT,
    "currentScore" DOUBLE PRECISION,
    "finalScore" DOUBLE PRECISION,
    "hasGrade" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasAssignment" (
    "id" TEXT NOT NULL,
    "canvasAssignmentId" INTEGER NOT NULL,
    "canvasCourseId" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "htmlUrl" TEXT,
    "pointsPossible" DOUBLE PRECISION,
    "submissionStatus" TEXT,
    "workflowState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasCourse_canvasCourseId_key" ON "CanvasCourse"("canvasCourseId");

-- CreateIndex
CREATE UNIQUE INDEX "CanvasAssignment_canvasAssignmentId_key" ON "CanvasAssignment"("canvasAssignmentId");

-- CreateIndex
CREATE INDEX "CanvasAssignment_canvasCourseId_idx" ON "CanvasAssignment"("canvasCourseId");

-- CreateIndex
CREATE INDEX "CanvasAssignment_dueAt_idx" ON "CanvasAssignment"("dueAt");

-- AddForeignKey
ALTER TABLE "CanvasAssignment" ADD CONSTRAINT "CanvasAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "CanvasCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
