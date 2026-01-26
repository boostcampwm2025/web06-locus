import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RecordTagDto } from './dto/record-response.dto';
import { TagNotFoundException } from '@/tags/exception/tags.exception';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class RecordTagsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecordTags(
    tx: Prisma.TransactionClient,
    userId: bigint,
    recordId: bigint,
    tagPublicIds?: string[],
  ): Promise<RecordTagDto[]> {
    if (!tagPublicIds?.length) {
      return [];
    }

    const tags = await tx.tag.findMany({
      where: {
        userId,
        publicId: { in: tagPublicIds },
      },
      select: {
        id: true,
        publicId: true,
        name: true,
      },
    });

    if (tags.length !== tagPublicIds.length) {
      const foundPublicIds = new Set(tags.map((tag) => tag.publicId));
      const missing = tagPublicIds.find(
        (publicId) => !foundPublicIds.has(publicId),
      );
      throw new TagNotFoundException(missing ?? '');
    }

    await tx.recordTag.createMany({
      data: tags.map((tag) => ({
        recordId,
        tagId: tag.id,
      })),
    });

    return tags.map(({ publicId, name }) => ({ publicId, name }));
  }

  async getRecordTags(recordId: bigint): Promise<RecordTagDto[]> {
    const recordTags = await this.prisma.recordTag.findMany({
      where: { recordId },
      select: {
        tag: {
          select: {
            publicId: true,
            name: true,
          },
        },
      },
    });

    return recordTags.map((recordTag) => recordTag.tag);
  }
}
