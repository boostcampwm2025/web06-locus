import { Prisma } from '@prisma/client';

export const GRAPH_RAWS_SQL = (
  startRecordId: bigint,
  userId: bigint,
): Prisma.Sql => Prisma.sql`
WITH RECURSIVE reach AS (
  SELECT ${startRecordId}::bigint AS node_id, ARRAY[${startRecordId}::bigint] AS visited
  UNION ALL
  SELECT c.to_record_id AS node_id, r.visited || c.to_record_id
  FROM reach r
  JOIN locus.connections c
    ON c.from_record_id = r.node_id
   AND c.user_id = ${userId}
  WHERE NOT (c.to_record_id = ANY(r.visited))
),
component_nodes AS MATERIALIZED (
  SELECT DISTINCT node_id
  FROM reach
),
component_edges AS MATERIALIZED (
  SELECT DISTINCT
    LEAST(c.from_record_id, c.to_record_id)    AS a_id,
    GREATEST(c.from_record_id, c.to_record_id) AS b_id
  FROM locus.connections c
  JOIN component_nodes n1 ON n1.node_id = c.from_record_id
  JOIN component_nodes n2 ON n2.node_id = c.to_record_id
  WHERE c.user_id = ${userId}
)
SELECT
  'node'::text AS row_type,
  r.public_id   AS node_public_id,
  ST_Y(r.location) AS latitude,
  ST_X(r.location) AS longitude,
  NULL::text AS from_public_id,
  NULL::text AS to_public_id
FROM locus.records r
JOIN component_nodes cn ON cn.node_id = r.id
WHERE r.user_id = ${userId}

UNION ALL

SELECT
  'edge'::text AS row_type,
  NULL::text AS node_public_id,
  NULL::double precision AS latitude,
  NULL::double precision AS longitude,
  ra.public_id AS from_public_id,
  rb.public_id AS to_public_id
FROM component_edges e
JOIN locus.records ra ON ra.id = e.a_id
JOIN locus.records rb ON rb.id = e.b_id

ORDER BY row_type, node_public_id, from_public_id, to_public_id;
`;

export const GRAPH_NEIGHBOR_RAWS_SQL = (
  startRecordId: bigint,
): Prisma.Sql => Prisma.sql`
  WITH neighbors AS ( 
    SELECT to_record_id as record_id
    FROM locus.connections
    WHERE from_record_id=${startRecordId}
  ),
  thumb AS (
    SELECT DISTINCT ON (i.record_id)
      i.record_id,
      i.public_id         AS "thumbnailPublicId",
      i.thumbnail_url     AS "thumbnailUrl",
      i.thumbnail_width   AS "thumbnailWidth",
      i.thumbnail_height  AS "thumbnailHeight",
      i.thumbnail_size    AS "thumbnailSize"
    FROM locus.images i
    ORDER BY i.record_id ASC, i.order ASC
  )

  SELECT 
    r.id,
    r.public_id AS "publicId",
    r.title     AS "title",

    ST_Y(r.location::geometry) AS "latitude",
    ST_X(r.location::geometry) AS "longitude",

    r.location_name    AS "locationName",
    r.location_address AS "locationAddress",
    r.created_at       AS "createdAt",
    r.updated_at       AS "updatedAt",
    r.connections_count AS "connectionsCount",

    t."thumbnailPublicId",
    t."thumbnailUrl",
    t."thumbnailWidth",
    t."thumbnailHeight",
    t."thumbnailSize"
  FROM neighbors n
  JOIN locus.records r
    ON r.id = n.record_id
  LEFT JOIN thumb t
    ON t.record_id = r.id
  ORDER BY r.created_at DESC;
`;
