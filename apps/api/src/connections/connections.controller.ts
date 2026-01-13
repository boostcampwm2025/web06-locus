import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CreateConnectionRequestDto } from './dto/create-connection.request.dto';
import { CreateConnectionResponseDto } from './dto/create-connection.response.dto';
import { JwtAuthGuard } from '@/jwt/guard/jwt.auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  async createConnection(
    @CurrentUser('sub') userId: bigint,
    @Body() createConnectionDto: CreateConnectionRequestDto,
  ): Promise<CreateConnectionResponseDto> {
    const connection = await this.connectionsService.create(
      userId,
      createConnectionDto,
    );

    return {
      connection: {
        publicId: connection.publicId,
        fromRecordPublicId: connection.fromRecordPublicId,
        toRecordPublicId: connection.toRecordPublicId,
        createdAt: connection.createdAt,
      },
    };
  }
}
