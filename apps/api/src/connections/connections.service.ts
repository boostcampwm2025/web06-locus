import { Injectable } from '@nestjs/common';
import { CreateConnectionRequestDto } from './dto/create-connection.request.dto';
import {
  ConnectionAlreadyExistsException,
  RecordNotFoundException,
  SameRecordConnectionNotAllowedException,
} from './exceptions/business.exception';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: bigint,
    createConnectionDto: CreateConnectionRequestDto,
  ) {
    const { fromRecordPublicId, toRecordPublicId } = createConnectionDto;

    if (fromRecordPublicId === toRecordPublicId) {
      throw new SameRecordConnectionNotAllowedException(fromRecordPublicId);
    }

    const [fromRecord, toRecord] = await this.getRecords(
      fromRecordPublicId,
      toRecordPublicId,
    );

    await this.validateConnection(fromRecord, toRecord, userId);

    const [created] = await this.prismaService.$transaction([
      this.prismaService.connection.create({
        data: {
          userId,
          fromRecordId: fromRecord.id,
          toRecordId: toRecord.id,
        },
        select: {
          publicId: true,
          createdAt: true,
          fromRecord: { select: { publicId: true } },
          toRecord: { select: { publicId: true } },
        },
      }),
      this.prismaService.connection.create({
        data: {
          userId,
          fromRecordId: toRecord.id,
          toRecordId: fromRecord.id,
        },
        select: { id: true }, // 두 번째는 반환 최소화
      }),
    ]);

    return {
      publicId: created.publicId,
      createdAt: created.createdAt.toISOString(),
      fromRecordPublicId: created.fromRecord.publicId,
      toRecordPublicId: created.toRecord.publicId,
    };
  }

  async getRecords(fromRecordPublicId: string, toRecordPublicId: string) {
    const fromRecord = await this.prismaService.record.findUnique({
      where: { publicId: fromRecordPublicId },
      select: { id: true, userId: true, publicId: true },
    });

    const toRecord = await this.prismaService.record.findUnique({
      where: { publicId: toRecordPublicId },
      select: { id: true, userId: true, publicId: true },
    });

    //레코드 검증 ( 레코드 서비스단 보고 수정 필요 )
    if (!fromRecord) throw new RecordNotFoundException(fromRecordPublicId);
    if (!toRecord) throw new RecordNotFoundException(toRecordPublicId);

    // if (fromRecord.userId !== userId)
    //   throw new RecordAccessDeniedException(fromRecordPublicId);
    // if (toRecord.userId !== userId)
    //   throw new RecordAccessDeniedException(toRecordPublicId);

    return [fromRecord, toRecord];
  }

  async validateConnection(
    fromRecord: { id: bigint; publicId: string; userId: bigint },
    toRecord: { id: bigint; publicId: string; userId: bigint },
    userId: bigint,
  ) {
    //연결 검증
    // (A,B) 또는 (B,A) 중 하나라도 있으면 중복
    const existing = await this.prismaService.connection.findFirst({
      where: {
        userId,
        OR: [
          { fromRecordId: fromRecord.id, toRecordId: toRecord.id },
          { fromRecordId: toRecord.id, toRecordId: fromRecord.id },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConnectionAlreadyExistsException(
        fromRecord.publicId,
        toRecord.publicId,
      );
    }
  }
}
