import { Prisma } from '@prisma/client';

export const SELECT_RECORDS_IN_BOUNDS_SQL = (
  userId: bigint,
  swLng: number,
  swLat: number,
  neLng: number,
  neLat: number,
  sortOrder: 'asc' | 'desc',
  limit: number,
  offset: number,
) => {
  const orderDirection =
    sortOrder === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  return Prisma.sql`
    SELECT
      public_id AS "publicId",
      title,
      content,
      ST_Y(location) AS latitude,
      ST_X(location) AS longitude,
      location_name AS "locationName",
      location_address AS "locationAddress",
      tags,
      is_favorite AS "isFavorite",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM records
    WHERE user_id = ${userId}
      AND location IS NOT NULL
      AND ST_Within(
        location,
        ST_MakeEnvelope(${swLng}, ${swLat}, ${neLng}, ${neLat}, 4326)
      )
    ORDER BY created_at ${orderDirection}
    LIMIT ${limit} OFFSET ${offset}
  `;
};

export const COUNT_RECORDS_IN_BOUNDS_SQL = (
  userId: bigint,
  swLng: number,
  swLat: number,
  neLng: number,
  neLat: number,
) => Prisma.sql`
  SELECT COUNT(*)::int AS count
  FROM records
  WHERE user_id = ${userId}
    AND location IS NOT NULL
    AND ST_Within(
      location,
      ST_MakeEnvelope(${swLng}, ${swLat}, ${neLng}, ${neLat}, 4326)
    )
`;

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
