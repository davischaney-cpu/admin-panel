-- CreateTable
CREATE TABLE "ImportedCanvasGrade" (
    "id" TEXT NOT NULL,
    "canvasCourseId" INTEGER NOT NULL,
    "grade" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'better-canvas',
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportedCanvasGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportedCanvasGrade_canvasCourseId_key" ON "ImportedCanvasGrade"("canvasCourseId");
