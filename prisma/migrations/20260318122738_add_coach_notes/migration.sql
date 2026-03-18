-- CreateTable
CREATE TABLE "CoachNote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CoachNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachNote_createdAt_idx" ON "CoachNote"("createdAt");
