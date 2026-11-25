-- CreateTable
CREATE TABLE "ArtistGenreCache" (
    "id" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "genres" TEXT[],
    "source" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistGenreCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtistGenreCache_nameKey_key" ON "ArtistGenreCache"("nameKey");
