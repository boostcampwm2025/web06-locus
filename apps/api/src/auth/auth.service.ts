import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserWithoutPassword } from '../common/type/user.types';
import { JwtProvider } from '../jwt/jwt.provider';
import { compare, hash } from '../utils/password.utils';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { PendingUser } from './type/user';
import { RedisService } from '@/redis/redis.service';
import { MailService } from '@/mail/mail.service';
import { VerifyEmailRequest } from './dto/verify-email-request.dto';
import { LoginRequest } from './dto/login-request.dto';
import { Provider } from '@prisma/client';
import {
  EmailAlreadyExistsException,
  EmailAlreadySentException,
  EmailVerificationExpiredException,
  EmailVerificationFailedException,
  EmailVerificationTooManyTriesException,
  InvalidCredentialsException,
  SocialAlreadyLoginException,
} from './exception';

@Injectable()
export class AuthService {
  private readonly PENDING_USER_PREFIX = 'PENDING_USER:';
  private readonly CODE_LENGTH = 6;
  private readonly VALIDATE_EMAIL_TTL = 600;
  private readonly MAX_RETRY = 3;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtProvider: JwtProvider,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async requestSignup(request: SignUpRequest): Promise<void> {
    const { email, password, nickname } = request;

    if (await this.usersService.isExistsByEmail(email)) {
      throw new EmailAlreadyExistsException();
    }

    const redisKey = this.getPendingUserRedisKey(email);

    // 중복 요청 방지
    if (await this.redisService.get(redisKey)) {
      throw new EmailAlreadySentException();
    }

    const code = this.generateVerificationCode();
    const hashedPassword = await hash(password);

    const pendingUser: PendingUser = {
      email,
      hashedPassword,
      nickname,
      code,
      retryCount: 0,
    };

    await this.redisService.set(
      redisKey,
      JSON.stringify(pendingUser),
      this.VALIDATE_EMAIL_TTL,
    );

    await this.mailService.sendVerificationEmail(email, code);
  }

  async login(request: LoginRequest) {
    const { email, password } = request;

    const user = await this.usersService.findByEmail(email);

    if (user.provider !== Provider.LOCAL || !user.password) {
      throw new SocialAlreadyLoginException(user.provider);
    }

    const isPasswordMatched = await compare(password, user.password);
    if (!isPasswordMatched) throw new InvalidCredentialsException();

    const { password: _, ...userWithoutPassword } = user;
    return this.generateTokens(userWithoutPassword);
  }

  async completeSignup(request: VerifyEmailRequest): Promise<void> {
    const { email, code } = request;
    const redisKey = this.getPendingUserRedisKey(email);

    const data = await this.redisService.get(redisKey);
    if (!data) throw new EmailVerificationExpiredException();

    const pendingUser = JSON.parse(data) as PendingUser;

    if (pendingUser.retryCount >= this.MAX_RETRY) {
      await this.redisService.del(redisKey);
      throw new EmailVerificationTooManyTriesException();
    }

    if (pendingUser.code !== code) {
      pendingUser.retryCount++;
      await this.redisService.set(
        redisKey,
        JSON.stringify(pendingUser),
        this.VALIDATE_EMAIL_TTL,
      );
      throw new EmailVerificationFailedException(pendingUser.retryCount);
    }

    await this.usersService.signup(
      pendingUser.email,
      pendingUser.hashedPassword,
      pendingUser.nickname,
    );

    await this.redisService.del(redisKey);
  }

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

      const user = await this.usersService.findById(BigInt(userId));
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

  private generateVerificationCode(): string {
    return Math.floor(Math.random() * Math.pow(10, this.CODE_LENGTH))
      .toString()
      .padStart(this.CODE_LENGTH, '0');
  }

  private getPendingUserRedisKey(email: string): string {
    return `${this.PENDING_USER_PREFIX}${email}`;
  }
}
