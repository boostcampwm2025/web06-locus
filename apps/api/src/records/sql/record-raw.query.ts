import { Prisma } from '@prisma/client';

export const UPDATE_RECORD_LOCATION_SQL = (
  recordId: bigint,
  longitude: number,
  latitude: number,
) => Prisma.sql`
  UPDATE records
  SET location = ST_SetSRID(
    ST_MakePoint(${longitude}, ${latitude}),
    4326
  )
  WHERE id = ${recordId}
  RETURNING
    id,
    public_id AS "publicId", 
    title,
    content,
    ST_X(location) AS longitude,
    ST_Y(location) AS latitude,
    location_name AS "locationName",
    location_address AS "locationAddress",
    tags,
    is_favorite AS "isFavorite",
    created_at AS "createdAt",
    updated_at AS "updatedAt"
`;

export const GET_RECORD_LOCATION_SQL = (recordId: bigint) => Prisma.sql`
  SELECT 
    ST_X(location::geometry) as longitude,
    ST_Y(location::geometry) as latitude
  FROM records
  WHERE id = ${recordId}
`;
