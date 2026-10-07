-- CreateTable
CREATE TABLE "EraSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tracksAnalyzed" INTEGER NOT NULL,
    "dominantDecade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EraSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EraCount" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "decade" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "EraCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EraSnapshot_userId_createdAt_idx" ON "EraSnapshot"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "EraSnapshot" ADD CONSTRAINT "EraSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EraCount" ADD CONSTRAINT "EraCount_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "EraSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
