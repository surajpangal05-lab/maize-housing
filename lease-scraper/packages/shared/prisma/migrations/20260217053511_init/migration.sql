-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceListingId" TEXT,
    "canonicalUrl" TEXT NOT NULL,
    "title" TEXT,
    "street" TEXT,
    "unit" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "priceMin" DOUBLE PRECISION,
    "priceMax" DOUBLE PRECISION,
    "beds" INTEGER,
    "baths" DOUBLE PRECISION,
    "sqft" INTEGER,
    "propertyType" TEXT,
    "availabilityDate" TIMESTAMP(3),
    "leaseTerm" TEXT,
    "deposit" DOUBLE PRECISION,
    "feesJson" JSONB,
    "amenitiesJson" JSONB,
    "description" TEXT,
    "contactJson" JSONB,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "originalUrl" TEXT NOT NULL,
    "storedUrl" TEXT,
    "storedPath" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "mimeType" TEXT,
    "checksumSha256" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "listingsUpserted" INTEGER NOT NULL DEFAULT 0,
    "listingsSkipped" INTEGER NOT NULL DEFAULT 0,
    "imagesDownloaded" INTEGER NOT NULL DEFAULT 0,
    "errorsJson" JSONB,
    "checkpoint" JSONB,

    CONSTRAINT "IngestRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_name_key" ON "Source"("name");

-- CreateIndex
CREATE INDEX "Listing_city_idx" ON "Listing"("city");

-- CreateIndex
CREATE INDEX "Listing_priceMin_priceMax_idx" ON "Listing"("priceMin", "priceMax");

-- CreateIndex
CREATE INDEX "Listing_beds_idx" ON "Listing"("beds");

-- CreateIndex
CREATE INDEX "Listing_baths_idx" ON "Listing"("baths");

-- CreateIndex
CREATE INDEX "Listing_lat_lng_idx" ON "Listing"("lat", "lng");

-- CreateIndex
CREATE INDEX "Listing_availabilityDate_idx" ON "Listing"("availabilityDate");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_sourceId_sourceListingId_key" ON "Listing"("sourceId", "sourceListingId");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_sourceId_canonicalUrl_key" ON "Listing"("sourceId", "canonicalUrl");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_idx" ON "ListingImage"("listingId");

-- CreateIndex
CREATE INDEX "ListingImage_checksumSha256_idx" ON "ListingImage"("checksumSha256");

-- CreateIndex
CREATE INDEX "IngestRun_sourceId_idx" ON "IngestRun"("sourceId");

-- CreateIndex
CREATE INDEX "IngestRun_startedAt_idx" ON "IngestRun"("startedAt");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestRun" ADD CONSTRAINT "IngestRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
