import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import { GoogleStrategy } from '../../../src/auth/strategies/google.strategy';
import { UsersService } from '../../../src/users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('GoogleStrategy 테스트', () => {
  let strategy: GoogleStrategy;
  let usersService: UsersService;
  let configService: ConfigService;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const config = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-client-secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
      };
      return config[key];
    }),
  };

  const mockUsersService = {
    findOrCreateOAuthUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    usersService = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate 메서드 테스트', () => {
    const mockProfile = {
      id: 'google-user-id-123',
      displayName: 'beomsic',
      emails: [{ value: 'beomsic@google.com', verified: true }],
      photos: [{ value: 'https://example.com/photo.jpg' }],
      provider: 'google',
    };

    const mockUser = {
      id: 1,
      email: 'beomsic@google.com',
      name: 'beomsic',
      profileImageUrl: 'https://example.com/photo.jpg',
      provider: Provider.GOOGLE,
      providerId: 'google-user-id-123',
    };

    test('authentication에 성공하면 validate를 실행한 후 user를 return 해야 한다', async () => {
      // given
      const done = jest.fn();
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(
        'access-token',
        'refresh-token',
        mockProfile as any,
        done,
      );

      // then
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'beomsic@google.com',
        'beomsic',
        'https://example.com/photo.jpg',
        Provider.GOOGLE,
        'google-user-id-123',
      );
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    test('이메일 정보가 없는 경우 UnauthorizedException을 던져야 한다', async () => {
      // given
      const done = jest.fn();
      const profileWithoutEmail = {
        ...mockProfile,
        emails: [],
      };
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(
        'access-token',
        'refresh-token',
        profileWithoutEmail as any,
        done,
      );

      // then
      expect(usersService.findOrCreateOAuthUser).not.toHaveBeenCalled();
      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException));
    });

    test('이메일이 undefined인 경우 UnauthorizedException을 던져야 한다', async () => {
      // given
      const done = jest.fn();
      const profileWithUndefinedEmails = {
        ...mockProfile,
        emails: undefined,
      };
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(
        'access-token',
        'refresh-token',
        profileWithUndefinedEmails as any,
        done,
      );

      // then
      expect(usersService.findOrCreateOAuthUser).not.toHaveBeenCalled();
      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException));
    });

    test('프로필 이미지가 없는 경우 null값을 넣어줘야 한다', async () => {
      // given
      const done = jest.fn();
      const profileWithoutPhoto = {
        ...mockProfile,
        photos: [],
      };
      mockUsersService.findOrCreateOAuthUser.mockResolvedValue(mockUser);

      // when
      await strategy.validate(
        'access-token',
        'refresh-token',
        profileWithoutPhoto as any,
        done,
      );

      // then
      expect(usersService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        'beomsic@google.com',
        'beomsic',
        null,
        Provider.GOOGLE,
        'google-user-id-123',
      );
    });

    test('유저 서비스에서 에러가 생할 경우 error done 을 실행해야 한다', async () => {
      // given
      const done = jest.fn();
      const error = new Error('데이터베이스 에러');
      mockUsersService.findOrCreateOAuthUser.mockRejectedValue(error);

      // when
      await strategy.validate(
        'access-token',
        'refresh-token',
        mockProfile as any,
        done,
      );

      // then
      expect(done).toHaveBeenCalledWith(error);
      expect(done).not.toHaveBeenCalledWith(null, expect.anything());
    });
  });

  describe('생성자 테스트', () => {
    test('환경변수 값을 통해서 init 되어야 한다', () => {
      // when & then
      expect(configService.getOrThrow).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'GOOGLE_CLIENT_SECRET',
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'GOOGLE_CALLBACK_URL',
      );
    });
  });
});
