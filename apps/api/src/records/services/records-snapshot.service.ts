import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RecordSyncPayload } from '../type/record-sync.types';

/**
 * ES 동기화용 스냅샷에 필요한 컬럼/관계.
 * - 기록, 태그, 첫 이미지(썸네일)를 쿼리 한 번으로 읽는다.
 */
const SNAPSHOT_SELECT = {
  id: true,
  publicId: true,
  userId: true,
  title: true,
  content: true,
  isFavorite: true,
  locationName: true,
  locationAddress: true,
  connectionsCount: true,
  createdAt: true,
  tags: { select: { tag: { select: { name: true } } } },
  images: {
    orderBy: { order: 'asc' },
    take: 1,
    select: { thumbnailUrl: true },
  },
} satisfies Prisma.RecordSelect;

export type RecordSnapshotRow = Prisma.RecordGetPayload<{
  select: typeof SNAPSHOT_SELECT;
}>;

/**
 * DB 행 → ES 동기화 payload(완전한 스냅샷) 변환
 * - connectionsCount, isFavorite 등 모든 필드를 DB 값 그대로 채운다.
 */
export const toRecordSyncPayload = (
  row: RecordSnapshotRow,
): RecordSyncPayload => {
  const thumbnailImage = row.images[0]?.thumbnailUrl ?? null;

  return {
    recordId: row.id.toString(),
    publicId: row.publicId,
    userId: row.userId.toString(),
    title: row.title,
    content: row.content,
    isFavorite: row.isFavorite,
    locationName: row.locationName,
    locationAddress: row.locationAddress,
    tags: row.tags.map(({ tag }) => tag.name),
    hasImages: !!thumbnailImage,
    thumbnailImage,
    connectionsCount: row.connectionsCount,
    createdAt: row.createdAt.toISOString(),
  };
};

@Injectable()
export class RecordSnapshotService {
  /**
   * 변경이 반영된 트랜잭션 안에서 호출해 "이 시점의 기록 전체 상태"를 만든다.
   * - Outbox 이벤트가 항상 완전한 스냅샷을 싣게 해, 컨슈머가 DB를 다시 읽지 않고도
   *   버전(outbox id) 기준으로 ES를 덮어쓸 수 있게 한다.
   * - 기록이 없으면 예외를 던져 호출한 트랜잭션이 롤백되도록 한다.
   */
  async buildSnapshot(
    tx: Prisma.TransactionClient,
    recordId: bigint,
  ): Promise<RecordSyncPayload> {
    const row = await tx.record.findUniqueOrThrow({
      where: { id: recordId },
      select: SNAPSHOT_SELECT,
    });

    return toRecordSyncPayload(row);
  }
}
