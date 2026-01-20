import { Injectable } from '@nestjs/common';
import { CreateTagRequestDto } from './dto/create-tag.request.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  InvalidTagNameException,
  TagAlreadyExistsException,
} from './exception/tags.exception';

@Injectable()
export class TagsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createOne(
    userId: bigint,
    requestDto: CreateTagRequestDto,
  ): Promise<{ id: bigint; name: string; isSystem: boolean }> {
    await this.validateTagName(requestDto.name);

    const created = await this.prismaService.tag.create({
      data: {
        name: requestDto.name,
        isSystem: false,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        isSystem: true,
      },
    });

    return created;
  }

  async findByName(name: string) {
    return await this.prismaService.tag.findFirst({
      where: {
        name: name,
      },
    });
  }

  private async validateTagName(name: string) {
    if (name.length === 0) {
      throw new InvalidTagNameException(name);
    }

    if (name.length > 5) {
      throw new InvalidTagNameException(name);
    }

    if ((await this.findByName(name)) !== null) {
      throw new TagAlreadyExistsException(name);
    }
  }
}
