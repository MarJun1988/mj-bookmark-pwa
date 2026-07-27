-- CreateTable
CREATE TABLE "versions" (
    "id" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "comment" TEXT,

    CONSTRAINT "versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "versions_versionNumber_key" ON "versions"("versionNumber");
