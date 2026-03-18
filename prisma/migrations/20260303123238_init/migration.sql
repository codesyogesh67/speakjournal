-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topic" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "transcriptRaw" TEXT NOT NULL,
    "transcriptClean" TEXT,
    "transcriptNative" TEXT,
    "estimatedWords" INTEGER,
    "wpm" DOUBLE PRECISION,
    "analysisJson" JSONB,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");
