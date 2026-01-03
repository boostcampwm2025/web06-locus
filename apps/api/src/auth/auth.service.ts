import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserWithoutPassword } from '../common/type/user.types';
import { JwtProvider } from '../jwt/jwt.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtProvider: JwtProvider,
  ) {}

  // TODO: 이메일 - 패스워드를 통한 회원가입 / 로그인 기능

  async generateTokens(user: UserWithoutPassword) {
    return {
      accessToken: await this.jwtProvider.generateAccessToken(
        user.id,
        user.email,
        user.provider,
      ),
      refreshToken: await this.jwtProvider.generateRefreshToken(user.id),
    };
  }

  async reissueAccessToken(refreshToken: string) {
    try {
      const userId = await this.jwtProvider.verifyRefreshToken(refreshToken);

      const user = await this.usersService.findById(userId);
      const accessToken = await this.jwtProvider.generateAccessToken(
        user.id,
        user.email,
        user.provider,
      );
      return { accessToken };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('토큰 갱신에 실패했습니다');
    }
  }
}
