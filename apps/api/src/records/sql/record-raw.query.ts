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
    FROM locus.records
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
  FROM locus.records
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
  UPDATE locus.records
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
  FROM locus.records
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
    FROM locus.records
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
  FROM locus.records
  WHERE user_id = ${userId}
    AND location IS NOT NULL
    AND ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      ${radiusMeters}
    )
`;

export const SELECT_ALL_RECORDS_SQL = (
  userId: bigint,
  sortOrder: 'asc' | 'desc',
  limit: number,
  offset: number,
  startDate?: Date,
  endDate?: Date,
  tagIds?: bigint[],
) => {
  const orderDirection =
    sortOrder === 'desc' ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  const dateFilter =
    startDate && endDate
      ? Prisma.sql`AND r.created_at >= ${startDate} AND r.created_at <= ${endDate}`
      : startDate
        ? Prisma.sql`AND r.created_at >= ${startDate}`
        : endDate
          ? Prisma.sql`AND r.created_at <= ${endDate}`
          : Prisma.empty;

  const tagFilter =
    tagIds && tagIds.length > 0
      ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM locus.record_tag rt
          WHERE rt.record_id = r.id AND rt.tag_id IN (${Prisma.join(tagIds)})
        )`
      : Prisma.empty;

  return Prisma.sql`
    SELECT
      r.id,
      r.public_id AS "publicId",
      r.title,
      r.content,
      ST_Y(r.location) AS latitude,
      ST_X(r.location) AS longitude,
      r.location_name AS "locationName",
      r.location_address AS "locationAddress",
      r.is_favorite AS "isFavorite",
      r.created_at AS "createdAt",
      r.updated_at AS "updatedAt"
    FROM locus.records r
    WHERE r.user_id = ${userId}
      ${dateFilter}
      ${tagFilter}
    ORDER BY r.created_at ${orderDirection}
    LIMIT ${limit} OFFSET ${offset}
  `;
};

export const COUNT_ALL_RECORDS_SQL = (
  userId: bigint,
  startDate?: Date,
  endDate?: Date,
  tagIds?: bigint[],
) => {
  const dateFilter =
    startDate && endDate
      ? Prisma.sql`AND r.created_at >= ${startDate} AND r.created_at <= ${endDate}`
      : startDate
        ? Prisma.sql`AND r.created_at >= ${startDate}`
        : endDate
          ? Prisma.sql`AND r.created_at <= ${endDate}`
          : Prisma.empty;

  const tagFilter =
    tagIds && tagIds.length > 0
      ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM locus.record_tag rt
          WHERE rt.record_id = r.id AND rt.tag_id IN (${Prisma.join(tagIds)})
        )`
      : Prisma.empty;

  return Prisma.sql`
    SELECT COUNT(*)::int AS count
    FROM locus.records r
    WHERE r.user_id = ${userId}
      ${dateFilter}
      ${tagFilter}
  `;
};
