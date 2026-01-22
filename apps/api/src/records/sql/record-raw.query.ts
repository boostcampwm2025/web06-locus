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
      id,
      public_id AS "publicId",
      title,
      content,
      ST_Y(location) AS latitude,
      ST_X(location) AS longitude,
      location_name AS "locationName",
      location_address AS "locationAddress",
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
    content,
    title,
    ST_X(location) AS longitude,
    ST_Y(location) AS latitude,
    location_name AS "locationName",
    location_address AS "locationAddress",
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

export const SELECT_RECORDS_BY_LOCATION_SQL = (
  userId: bigint,
  latitude: number,
  longitude: number,
  radiusMeters: number,
  sortOrder: 'asc' | 'desc',
  limit: number,
  offset: number,
) => {
  const orderDirection =
    sortOrder === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  return Prisma.sql`
    SELECT
      id,
      public_id AS "publicId",
      title,
      content,
      ST_Y(location) AS latitude,
      ST_X(location) AS longitude,
      location_name AS "locationName",
      location_address AS "locationAddress",
      is_favorite AS "isFavorite",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM records
    WHERE user_id = ${userId}
      AND location IS NOT NULL
      AND ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
    ORDER BY created_at ${orderDirection}
    LIMIT ${limit} OFFSET ${offset}
  `;
};

export const COUNT_RECORDS_BY_LOCATION_SQL = (
  userId: bigint,
  latitude: number,
  longitude: number,
  radiusMeters: number,
) => Prisma.sql`
  SELECT COUNT(*)::int AS count
  FROM records
  WHERE user_id = ${userId}
    AND location IS NOT NULL
    AND ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      ${radiusMeters}
    )
`;
