import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateTagRequestDto } from './dto/create-tag.request.dto';
import { TagsService } from './tags.services';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { DeleteTagResponseDto } from './dto/delete-tag.response.dto';
import { TagsResponseDto } from './dto/tags.response.dto';
@Controller('tags')
export class TagsController {
  constructor(private readonly tagService: TagsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser('sub') userId: bigint,
    @Body() requestDto: CreateTagRequestDto,
  ) {
    const result = await this.tagService.createOne(userId, requestDto);

    return { tag: result };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':publicId')
  async delete(
    @CurrentUser('sub') userId: bigint,
    @Param('publicId') publicId: string,
  ): Promise<DeleteTagResponseDto> {
    const result = await this.tagService.deleteOne(userId, publicId);

    return { deleted: { publicId: result.publicId } };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTags(@CurrentUser('sub') userId: bigint): Promise<TagsResponseDto> {
    const tags = await this.tagService.findAll(userId);

    return {
      tags: tags.map((tag) => ({
        publicId: tag.publicId,
        name: tag.name,
        isSystem: tag.isSystem,
      })),
    };
  }
}
