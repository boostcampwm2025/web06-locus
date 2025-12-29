import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Provider } from '@prisma/client';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtProvider } from '../../src/auth/jwt/jwt.provider';
import { UserWithoutPassword } from '../../src/common/type/user.types';

describe('AuthService 테스트', () => {
  let authService: AuthService;
  let jwtProvider: JwtProvider;
  let usersService: UsersService;

  const mockUser: UserWithoutPassword = {
    id: 1,
    email: 'test@example.com',
    nickname: 'Test User',
    provider: Provider.GOOGLE,
    providerId: 'google-123',
    profileImageUrl: 'https://example.com/photo.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJwtProvider = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtProvider,
          useValue: mockJwtProvider,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtProvider = module.get<JwtProvider>(JwtProvider);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    test('액세스 토큰과 리프레시 토큰을 모두 생성해야 한다', async () => {
      // given
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockJwtProvider.generateAccessToken.mockResolvedValue(accessToken);
      mockJwtProvider.generateRefreshToken.mockResolvedValue(refreshToken);

      // when
      const result = await authService.generateTokens(mockUser);

      // then
      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
      expect(jwtProvider.generateAccessToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.provider,
      );
      expect(jwtProvider.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
      );
    });

    test('제대로된 사용자 정보로 액세스 토큰을 생성해야 한다', async () => {
      // given
      mockJwtProvider.generateAccessToken.mockResolvedValue('access-token');
      mockJwtProvider.generateRefreshToken.mockResolvedValue('refresh-token');

      // when
      await authService.generateTokens(mockUser);

      // then
      expect(jwtProvider.generateAccessToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.provider,
      );
      expect(jwtProvider.generateAccessToken).toHaveBeenCalledTimes(1);
    });

    test('사용자 ID로 리프레시 토큰을 생성해야 한다', async () => {
      // given
      mockJwtProvider.generateAccessToken.mockResolvedValue('access-token');
      mockJwtProvider.generateRefreshToken.mockResolvedValue('refresh-token');

      // when
      await authService.generateTokens(mockUser);

      // then
      expect(jwtProvider.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(jwtProvider.generateRefreshToken).toHaveBeenCalledTimes(1);
    });

    test('사용자 정보가 null이면 에러가 발생해야 한다', async () => {
      // when & then
      await expect(authService.generateTokens(null as any)).rejects.toThrow();
    });

    test('사용자 정보가 undefined이면 에러가 발생해야 한다', async () => {
      // when & then
      await expect(
        authService.generateTokens(undefined as any),
      ).rejects.toThrow();
    });

    test('액세스 토큰 생성 중 에러가 발생하면 에러를 던져야 한다', async () => {
      // given
      mockJwtProvider.generateAccessToken.mockRejectedValue(
        new Error('Access token generation failed'),
      );

      // when & then
      await expect(authService.generateTokens(mockUser)).rejects.toThrow(
        'Access token generation failed',
      );
    });

    test('리프레시 토큰 생성 중 에러가 발생하면 에러를 던져야 한다', async () => {
      // given
      mockJwtProvider.generateAccessToken.mockResolvedValue('access-token');
      mockJwtProvider.generateRefreshToken.mockRejectedValue(
        new Error('Refresh token generation failed'),
      );

      // when & then
      await expect(authService.generateTokens(mockUser)).rejects.toThrow(
        'Refresh token generation failed',
      );
    });
  });

  describe('reissueAccessToken', () => {
    const validRefreshToken = 'valid-refresh-token';
    const userId = 1;

    test('유효한 리프레시 토큰으로 새 액세스 토큰을 발급해야 한다', async () => {
      // given
      const newAccessToken = 'new-access-token';
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtProvider.generateAccessToken.mockResolvedValue(newAccessToken);

      // when
      const result = await authService.reissueAccessToken(validRefreshToken);

      // then
      expect(result).toEqual({ accessToken: newAccessToken });
      expect(jwtProvider.verifyRefreshToken).toHaveBeenCalledWith(
        validRefreshToken,
      );
      expect(usersService.findById).toHaveBeenCalledWith(userId);
    });

    test('리프레시 토큰 검증 후 올바른 사용자 ID로 조회해야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtProvider.generateAccessToken.mockResolvedValue('token');

      // when
      await authService.reissueAccessToken(validRefreshToken);

      // then
      expect(jwtProvider.verifyRefreshToken).toHaveBeenCalledWith(
        validRefreshToken,
      );
      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(usersService.findById).toHaveBeenCalledTimes(1);
    });

    test('조회한 사용자 정보로 새 액세스 토큰을 생성해야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtProvider.generateAccessToken.mockResolvedValue('new-token');

      // when
      await authService.reissueAccessToken(validRefreshToken);

      // then
      expect(jwtProvider.generateAccessToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.provider,
      );
    });

    test('만료된 리프레시 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockRejectedValue(
        new UnauthorizedException('토큰이 만료되었습니다'),
      );

      // when & then
      await expect(
        authService.reissueAccessToken(validRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.reissueAccessToken(validRefreshToken),
      ).rejects.toThrow('토큰이 만료되었습니다');
    });

    test('잘못된 형식의 리프레시 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockRejectedValue(
        new UnauthorizedException('유효하지 않은 토큰입니다'),
      );

      // when & then
      await expect(
        authService.reissueAccessToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    test('변조된 리프레시 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockRejectedValue(
        new UnauthorizedException('토큰 서명이 유효하지 않습니다'),
      );

      // when & then
      await expect(
        authService.reissueAccessToken('tampered-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    test('빈 문자열 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockRejectedValue(
        new UnauthorizedException('토큰이 제공되지 않았습니다'),
      );

      // when & then
      await expect(authService.reissueAccessToken('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('null 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockRejectedValue(
        new UnauthorizedException('토큰이 제공되지 않았습니다'),
      );

      // when & then
      await expect(authService.reissueAccessToken(null as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    test('사용자를 찾을 수 없으면 NotFoundException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockUsersService.findById.mockRejectedValue(
        new NotFoundException('사용자를 찾을 수 없습니다.'),
      );

      // when & then
      await expect(
        authService.reissueAccessToken(validRefreshToken),
      ).rejects.toThrow(NotFoundException);
      await expect(
        authService.reissueAccessToken(validRefreshToken),
      ).rejects.toThrow('사용자를 찾을 수 없습니다.');
    });
  });
});
