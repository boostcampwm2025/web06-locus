import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { RedisService } from '../../src/redis/redis.service';
import { MailService } from '../../src/mail/mail.service';
import { JwtProvider } from '../../src/jwt/jwt.provider';
import { UserWithoutPassword } from '../../src/common/type/user.types';
import * as passwordUtils from '../../src/utils/password.utils';
import {
  EmailAlreadyExistsException,
  EmailAlreadySentException,
  EmailVerificationExpiredException,
  EmailVerificationFailedException,
  EmailVerificationTooManyTriesException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  SocialAlreadyLoginException,
} from '@/auth/exception';
import { UserNotFoundException } from '@/users/exception';

describe('AuthService 테스트', () => {
  let authService: AuthService;
  let jwtProvider: JwtProvider;
  let usersService: UsersService;
  let redisService: RedisService;
  let mailService: MailService;

  const mockUser: UserWithoutPassword = {
    id: 1n,
    publicId: 'publicId',
    email: 'test@example.com',
    nickname: 'Test User',
    provider: Provider.GOOGLE,
    providerId: 'google-123',
    profileImageUrl: 'https://example.com/photo.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLocalUser = {
    id: 2,
    publicId: 'publicId',
    email: 'local@example.com',
    nickname: 'Local User',
    password: '$2b$10$hashedPassword123',
    provider: Provider.LOCAL,
    providerId: null,
    profileImageUrl: null,
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
    findByEmail: jest.fn(),
    isExistsByEmail: jest.fn(),
    signup: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    exists: jest.fn(),
    ttl: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        REFRESH_TOKEN_TTL: 604800, // 7일 (초 단위)
      };
      return config[key] ?? defaultValue;
    }),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
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
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtProvider = module.get<JwtProvider>(JwtProvider);
    usersService = module.get<UsersService>(UsersService);
    redisService = module.get<RedisService>(RedisService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestSignup', () => {
    const signUpRequest = {
      email: 'newuser@example.com',
      password: 'password123',
      nickname: 'New User',
    };

    test('새로운 사용자 회원가입 요청 시 이메일 인증 코드를 발송해야 한다', async () => {
      // given
      mockUsersService.isExistsByEmail.mockResolvedValue(false);
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue('OK');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      // when
      await authService.requestSignup(signUpRequest);

      // then
      expect(usersService.isExistsByEmail).toHaveBeenCalledWith(
        signUpRequest.email,
      );
      expect(redisService.set).toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        signUpRequest.email,
        expect.any(String), // 6자리 코드
      );
    });

    test('이미 가입된 이메일이면 ConflictException을 던져야 한다', async () => {
      // given
      mockUsersService.isExistsByEmail.mockResolvedValue(true);

      // when & then
      await expect(authService.requestSignup(signUpRequest)).rejects.toThrow(
        EmailAlreadyExistsException,
      );
      await expect(authService.requestSignup(signUpRequest)).rejects.toThrow(
        '이미 가입된 이메일입니다',
      );
      expect(redisService.set).not.toHaveBeenCalled();
      expect(mailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    test('이미 인증 코드가 발송된 경우 ConflictException을 던져야 한다', async () => {
      // given
      mockUsersService.isExistsByEmail.mockResolvedValue(false);
      mockRedisService.get.mockResolvedValue(
        JSON.stringify({
          email: signUpRequest.email,
          hashedPassword: 'hashed',
          code: '123456',
        }),
      );

      // when & then
      await expect(authService.requestSignup(signUpRequest)).rejects.toThrow(
        EmailAlreadySentException,
      );
      await expect(authService.requestSignup(signUpRequest)).rejects.toThrow(
        '이미 인증 코드가 발송되었습니다',
      );
    });

    test('Redis에 올바른 형식으로 임시 사용자 정보를 저장해야 한다', async () => {
      // given
      mockUsersService.isExistsByEmail.mockResolvedValue(false);
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue('OK');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      // when
      await authService.requestSignup(signUpRequest);

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        `PENDING_USER:${signUpRequest.email}`,
        expect.any(String),
        600, // TTL
      );

      const savedData = JSON.parse(mockRedisService.set.mock.calls[0][1]);
      expect(savedData).toHaveProperty('email', signUpRequest.email);
      expect(savedData).toHaveProperty('hashedPassword');
      expect(savedData).toHaveProperty('nickname', signUpRequest.nickname);
      expect(savedData).toHaveProperty('code');
      expect(savedData).toHaveProperty('retryCount', 0);
    });

    test('6자리 인증 코드를 생성해야 한다', async () => {
      // given
      mockUsersService.isExistsByEmail.mockResolvedValue(false);
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue('OK');
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      // when
      await authService.requestSignup(signUpRequest);

      // then
      const code = mockMailService.sendVerificationEmail.mock.calls[0][1];
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^\d{6}$/);
    });
  });

  describe('completeSignup', () => {
    const verifyRequest = {
      email: 'test@example.com',
      code: '123456',
    };

    const pendingUser = {
      email: 'test@example.com',
      hashedPassword: '$2b$10$hashed',
      nickname: 'Test',
      code: '123456',
      retryCount: 0,
    };

    test('올바른 코드로 이메일 인증 시 사용자를 생성해야 한다', async () => {
      // given
      mockRedisService.get.mockResolvedValue(JSON.stringify(pendingUser));
      mockUsersService.signup.mockResolvedValue(undefined);
      mockRedisService.del.mockResolvedValue(1);

      // when
      await authService.completeSignup(verifyRequest);

      // then
      expect(usersService.signup).toHaveBeenCalledWith(
        pendingUser.email,
        pendingUser.hashedPassword,
        pendingUser.nickname,
      );
      expect(redisService.del).toHaveBeenCalledWith(
        `PENDING_USER:${verifyRequest.email}`,
      );
    });

    test('인증 정보가 만료되었으면 BadRequestException을 던져야 한다', async () => {
      // given
      mockRedisService.get.mockResolvedValue(null);

      // when & then
      await expect(authService.completeSignup(verifyRequest)).rejects.toThrow(
        EmailVerificationExpiredException,
      );
      await expect(authService.completeSignup(verifyRequest)).rejects.toThrow(
        '인증 정보가 만료되었습니다.',
      );
    });

    test('잘못된 코드 입력 시 재시도 횟수를 증가시켜야 한다', async () => {
      // given
      mockRedisService.get.mockResolvedValue(JSON.stringify(pendingUser));

      // when & then
      await expect(
        authService.completeSignup({ ...verifyRequest, code: '999999' }),
      ).rejects.toThrow(EmailVerificationFailedException);
      await expect(
        authService.completeSignup({ ...verifyRequest, code: '999999' }),
      ).rejects.toThrow('인증 코드가 올바르지 않습니다.');

      const updatedData = JSON.parse(mockRedisService.set.mock.calls[0][1]);
      expect(updatedData.retryCount).toBe(1);
    });

    test('최대 재시도 횟수 초과 시 TOO_MANY_REQUESTS Exception을 던져야 한다', async () => {
      // given
      const maxRetriedUser = { ...pendingUser, retryCount: 3 };
      mockRedisService.get.mockResolvedValue(JSON.stringify(maxRetriedUser));
      mockRedisService.del.mockResolvedValue(1);

      // when & then
      await expect(authService.completeSignup(verifyRequest)).rejects.toThrow(
        EmailVerificationTooManyTriesException,
      );
      await expect(authService.completeSignup(verifyRequest)).rejects.toThrow(
        '인증 시도 횟수를 초과했습니다',
      );
      expect(redisService.del).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginRequest = {
      email: 'local@example.com',
      password: 'password123',
    };

    test('올바른 이메일과 비밀번호로 로그인 시 토큰을 반환해야 한다', async () => {
      // given
      mockUsersService.findByEmail.mockResolvedValue(mockLocalUser);
      mockJwtProvider.generateAccessToken.mockResolvedValue('access-token');
      mockJwtProvider.generateRefreshToken.mockResolvedValue('refresh-token');

      jest.spyOn(passwordUtils, 'compare').mockResolvedValue(true);
      // when
      const result = await authService.login(loginRequest);

      // then
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    test('OAuth 계정으로 로그인 시도 시 BadRequestException을 던져야 한다', async () => {
      // given
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // when & then
      await expect(authService.login(loginRequest)).rejects.toThrow(
        SocialAlreadyLoginException,
      );
      await expect(authService.login(loginRequest)).rejects.toThrow(
        `${mockUser.provider}로 가입된 계정입니다`,
      );
    });

    test('비밀번호가 일치하지 않으면 UnauthorizedException을 던져야 한다', async () => {
      // given
      mockUsersService.findByEmail.mockResolvedValue(mockLocalUser);
      jest.spyOn(passwordUtils, 'compare').mockResolvedValue(false);

      // when & then
      await expect(authService.login(loginRequest)).rejects.toThrow(
        InvalidCredentialsException,
      );
      await expect(authService.login(loginRequest)).rejects.toThrow(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    });
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

    test('생성된 Refresh Token을 Redis에 저장해야 한다', async () => {
      // given
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      mockJwtProvider.generateAccessToken.mockResolvedValue(accessToken);
      mockJwtProvider.generateRefreshToken.mockResolvedValue(refreshToken);
      mockRedisService.set.mockResolvedValue('OK');

      // when
      await authService.generateTokens(mockUser);

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        `REFRESH_TOKEN:${mockUser.id}`,
        refreshToken,
        expect.any(Number),
      );
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

    test('Redis 저장 실패 시 에러를 던져야 한다', async () => {
      // given
      mockJwtProvider.generateAccessToken.mockResolvedValue('access-token');
      mockJwtProvider.generateRefreshToken.mockResolvedValue('refresh-token');
      mockRedisService.set.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      // when & then
      await expect(authService.generateTokens(mockUser)).rejects.toThrow(
        'Redis connection failed',
      );
    });
  });

  describe('reissueTokens', () => {
    const validRefreshToken = 'valid-refresh-token';
    const userId = 1n;

    test('유효한 리프레시 토큰으로 새 토큰을 발급해야 한다', async () => {
      // given
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockRedisService.get.mockResolvedValue(validRefreshToken);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtProvider.generateAccessToken.mockResolvedValue(newAccessToken);
      mockJwtProvider.generateRefreshToken.mockResolvedValue(newRefreshToken);
      mockRedisService.set.mockResolvedValue('OK');

      // when
      const result = await authService.reissueTokens(validRefreshToken);

      // then
      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
      expect(jwtProvider.verifyRefreshToken).toHaveBeenCalledWith(
        validRefreshToken,
      );
    });

    test('Redis에 저장된 토큰과 요청 토큰을 비교해야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockRedisService.get.mockResolvedValue(validRefreshToken);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtProvider.generateAccessToken.mockResolvedValue('new-access-token');
      mockJwtProvider.generateRefreshToken.mockResolvedValue(
        'new-refresh-token',
      );
      mockRedisService.set.mockResolvedValue('OK');

      // when
      await authService.reissueTokens(validRefreshToken);

      // then
      expect(redisService.get).toHaveBeenCalledWith(`REFRESH_TOKEN:${userId}`);
    });

    test('Redis에 토큰이 없으면 InvalidRefreshTokenException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockRedisService.get.mockResolvedValue(null);

      // when & then
      await expect(
        authService.reissueTokens(validRefreshToken),
      ).rejects.toThrow(InvalidRefreshTokenException);
      await expect(
        authService.reissueTokens(validRefreshToken),
      ).rejects.toThrow('유효하지 않은 Refresh Token입니다');
    });

    test('Redis 토큰과 요청 토큰이 다르면 InvalidRefreshTokenException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockRedisService.get.mockResolvedValue('different-token');

      // when & then
      await expect(
        authService.reissueTokens(validRefreshToken),
      ).rejects.toThrow(InvalidRefreshTokenException);
      await expect(
        authService.reissueTokens(validRefreshToken),
      ).rejects.toThrow('유효하지 않은 Refresh Token입니다');
    });

    test('새로운 Refresh Token을 Redis에 저장해야 한다', async () => {
      // given
      const newRefreshToken = 'new-refresh-token';
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockRedisService.get.mockResolvedValue(validRefreshToken);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtProvider.generateAccessToken.mockResolvedValue('new-access-token');
      mockJwtProvider.generateRefreshToken.mockResolvedValue(newRefreshToken);
      mockRedisService.set.mockResolvedValue('OK');

      // when
      await authService.reissueTokens(validRefreshToken);

      // then
      expect(redisService.set).toHaveBeenCalledWith(
        `REFRESH_TOKEN:${mockUser.id}`,
        newRefreshToken,
        expect.any(Number),
      );
    });

    test('사용자를 찾을 수 없으면 UserNotFoundException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockResolvedValue(userId);
      mockRedisService.get.mockResolvedValue(validRefreshToken);
      mockUsersService.findById.mockRejectedValue(new UserNotFoundException());

      // when & then
      await expect(
        authService.reissueTokens(validRefreshToken),
      ).rejects.toThrow(UserNotFoundException);
      await expect(
        authService.reissueTokens(validRefreshToken),
      ).rejects.toThrow('사용자를 찾을 수 없습니다.');
    });

    test('만료된 리프레시 토큰이면 InvalidRefreshTokenException을 던져야 한다', async () => {
      // given
      mockJwtProvider.verifyRefreshToken.mockRejectedValue(
        new InvalidRefreshTokenException(),
      );

      // when & then
      await expect(
        authService.reissueTokens(validRefreshToken),
      ).rejects.toThrow(InvalidRefreshTokenException);
    });
  });
});
