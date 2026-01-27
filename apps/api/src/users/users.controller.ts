import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../jwt/guard/jwt.auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { GetMyProfileSwagger } from './swagger/users.swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @GetMyProfileSwagger()
  async getMyProfile(
    @CurrentUser('sub') userId: bigint,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    return UserResponseDto.from(user);
  }
}
