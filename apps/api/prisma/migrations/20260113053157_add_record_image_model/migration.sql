-- CreateTable
CREATE TABLE "records" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "content" VARCHAR(500),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location_name" VARCHAR(200) NOT NULL,
    "location_address" VARCHAR(500) NOT NULL,
    "tags" TEXT[],
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "record_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "thumbnail_width" INTEGER NOT NULL,
    "thumbnail_height" INTEGER NOT NULL,
    "thumbnail_size" INTEGER NOT NULL,
    "medium_url" TEXT NOT NULL,
    "medium_width" INTEGER NOT NULL,
    "medium_height" INTEGER NOT NULL,
    "medium_size" INTEGER NOT NULL,
    "original_url" TEXT NOT NULL,
    "original_width" INTEGER NOT NULL,
    "original_height" INTEGER NOT NULL,
    "original_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "records_public_id_key" ON "records"("public_id");

-- CreateIndex
CREATE INDEX "records_user_id_idx" ON "records"("user_id");

-- CreateIndex
CREATE INDEX "records_latitude_longitude_idx" ON "records"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "records_created_at_idx" ON "records"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "images_public_id_key" ON "images"("public_id");

-- CreateIndex
CREATE INDEX "images_record_id_idx" ON "images"("record_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_record_id_order_key" ON "images"("record_id", "order");

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
