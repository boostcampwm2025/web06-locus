import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { JwtProvider } from '../../../src/jwt/jwt.provider';
import { JwtPayload } from '../../../src/jwt/jwt-payload.interface';

describe('JwtProvider 테스트', () => {
  let jwtProvider: JwtProvider;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtProvider,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    jwtProvider = module.get<JwtProvider>(JwtProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    test('유저 정보로 Access Token을 생성해야 한다', async () => {
      // given
      const userId = 1;
      const email = 'test@example.com';
      const provider = Provider.LOCAL;
      const expectedToken = 'access-token';
      const accessSecret = 'access-secret';
      const expiresIn = '15m';

      mockConfigService.get
        .mockReturnValueOnce(accessSecret)
        .mockReturnValueOnce(expiresIn);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      // when
      const result = await jwtProvider.generateAccessToken(
        userId,
        email,
        provider,
      );

      // then
      expect(result).toBe(expectedToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, email, provider },
        { secret: accessSecret, expiresIn },
      );
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'JWT_ACCESS_EXPIRES_IN',
      );
    });

    test('에러가 발생하면 에러를 전파해야 한다', async () => {
      // given
      const userId = 1;
      const email = 'test@example.com';
      const provider = Provider.LOCAL;
      const error = new Error('JWT signing failed');

      mockConfigService.get.mockReturnValue('secret');
      mockJwtService.signAsync.mockRejectedValue(error);

      // when & then
      await expect(
        jwtProvider.generateAccessToken(userId, email, provider),
      ).rejects.toThrow(error);
    });
  });

  describe('generateRefreshToken', () => {
    test('유저 ID로 Refresh Token을 생성해야 한다', async () => {
      // given
      const userId = 1;
      const expectedToken = 'refresh-token';
      const refreshSecret = 'refresh-secret';
      const expiresIn = '7d';

      mockConfigService.get
        .mockReturnValueOnce(refreshSecret)
        .mockReturnValueOnce(expiresIn);
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      // when
      const result = await jwtProvider.generateRefreshToken(userId);

      // then
      expect(result).toBe(expectedToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId },
        { secret: refreshSecret, expiresIn },
      );
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'JWT_REFRESH_EXPIRES_IN',
      );
    });

    test('JWT 서비스에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      // given
      const userId = 1;
      const error = new Error('JWT signing failed');

      mockConfigService.get.mockReturnValue('secret');
      mockJwtService.signAsync.mockRejectedValue(error);

      // when & then
      await expect(jwtProvider.generateRefreshToken(userId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('verifyAccessToken', () => {
    test('유효한 Access Token을 검증하고 jwt 페이로드를 반환해야 한다', async () => {
      // given
      const token = 'valid-access-token';
      const accessSecret = 'access-secret';
      const expectedPayload: JwtPayload = {
        sub: 1,
        email: 'test@example.com',
        provider: Provider.LOCAL,
      };

      mockConfigService.get.mockReturnValue(accessSecret);
      mockJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      // when
      const result = await jwtProvider.verifyAccessToken(token);

      // then
      expect(result).toEqual(expectedPayload);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: accessSecret,
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
    });

    test('유효하지 않은 Access Token이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const token = 'invalid-token';
      const accessSecret = 'access-secret';

      mockConfigService.get.mockReturnValue(accessSecret);
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Token verification failed'),
      );

      // when & then
      await expect(jwtProvider.verifyAccessToken(token)).rejects.toThrow(
        new UnauthorizedException('유효하지 않은 Access Token입니다'),
      );
    });

    test('만료된 Access Token이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const token = 'expired-token';
      const accessSecret = 'access-secret';

      mockConfigService.get.mockReturnValue(accessSecret);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      // when & then
      await expect(jwtProvider.verifyAccessToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('빈 문자열 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const token = '';
      const accessSecret = 'access-secret';

      mockConfigService.get.mockReturnValue(accessSecret);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // when & then
      await expect(jwtProvider.verifyAccessToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyRefreshToken', () => {
    test('유효한 Refresh Token을 검증하고 유저 ID를 반환해야 한다', async () => {
      // given
      const token = 'valid-refresh-token';
      const refreshSecret = 'refresh-secret';
      const expectedUserId = 1;

      mockConfigService.get.mockReturnValue(refreshSecret);
      mockJwtService.verifyAsync.mockResolvedValue({ sub: expectedUserId });

      // when
      const result = await jwtProvider.verifyRefreshToken(token);

      // then
      expect(result).toBe(expectedUserId);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: refreshSecret,
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET');
    });

    test('유효하지 않은 Refresh Token이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const token = 'invalid-token';
      const refreshSecret = 'refresh-secret';

      mockConfigService.get.mockReturnValue(refreshSecret);
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Token verification failed'),
      );

      // when & then
      await expect(jwtProvider.verifyRefreshToken(token)).rejects.toThrow(
        new UnauthorizedException('유효하지 않은 Refresh Token입니다'),
      );
    });

    test('만료된 Refresh Token이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const token = 'expired-token';
      const refreshSecret = 'refresh-secret';

      mockConfigService.get.mockReturnValue(refreshSecret);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      // when & then
      await expect(jwtProvider.verifyRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('빈 문자열 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const token = '';
      const refreshSecret = 'refresh-secret';

      mockConfigService.get.mockReturnValue(refreshSecret);
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      // when & then
      await expect(jwtProvider.verifyRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('잘못된 형식의 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      const token = 'malformed.token';
      const refreshSecret = 'refresh-secret';

      mockConfigService.get.mockReturnValue(refreshSecret);
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Malformed token'),
      );

      // when & then
      await expect(jwtProvider.verifyRefreshToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
