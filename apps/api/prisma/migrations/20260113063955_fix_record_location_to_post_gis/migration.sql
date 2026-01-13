/*
  Warnings:

  - You are about to drop the column `latitude` on the `records` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `records` table. All the data in the column will be lost.
  - Added the required column `location` to the `records` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "records_latitude_longitude_idx";

-- AlterTable
ALTER TABLE "records" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "location" geometry(Point, 4326) NOT NULL;

CREATE INDEX idx_records_location ON records USING GIST (location);