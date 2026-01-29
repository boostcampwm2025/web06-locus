import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../../src/notification/notification.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotificationScheduleService } from '../../src/notification//notification-schedule.service';
import {
  FcmTokenRequiredException,
  InactiveNotificationException,
  NotificationNotFoundException,
} from '../../src/notification/exception/notification.exception';
import {
  UpdateNotificationSettingRequestDto,
  UpdateNotifyTimeDto,
} from '../../src/notification/dto/update-notification-setting.dto';
import { UserNotificationSetting } from '@prisma/client';

describe('NotificationService 테스트', () => {
  let service: NotificationService;
  let prismaService: PrismaService;
  let scheduleService: NotificationScheduleService;

  // Mock 데이터
  const mockUserId = BigInt(123);
  const mockFcmToken = 'mock_fcm_token_abc123';
  const mockNotifyTime = '19:00:00';

  const mockNotificationSetting: UserNotificationSetting = {
    id: BigInt(1),
    userId: mockUserId,
    isActive: true,
    notifyTime: mockNotifyTime,
    fcmToken: mockFcmToken,
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    userNotificationSetting: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockNotificationScheduleService = {
    addUserToBucket: jest.fn(),
    removeUserFromBucket: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationScheduleService,
          useValue: mockNotificationScheduleService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
    scheduleService = module.get<NotificationScheduleService>(
      NotificationScheduleService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSetting', () => {
    test('사용자의 알림 설정을 성공적으로 조회한다', async () => {
      // given
      mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
        mockNotificationSetting,
      );

      // when
      const result = await service.getSetting(mockUserId);

      // then
      expect(result).toEqual({
        isActive: true,
        notifyTime: mockNotifyTime,
      });
      expect(
        prismaService.userNotificationSetting.findUnique,
      ).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });

    test('알림 설정이 존재하지 않으면 NotificationNotFoundException을 던진다', async () => {
      // given
      mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
        null,
      );

      // when & then
      await expect(service.getSetting(mockUserId)).rejects.toThrow(
        NotificationNotFoundException,
      );
      expect(
        prismaService.userNotificationSetting.findUnique,
      ).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe('updateSetting', () => {
    const updateDto: UpdateNotificationSettingRequestDto = {
      isActive: true,
      fcmToken: mockFcmToken,
    };

    describe('성공 케이스', () => {
      test('신규 사용자의 알림 설정을 성공적으로 생성한다', async () => {
        // given
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          null,
        );
        mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
          mockNotificationSetting,
        );
        mockNotificationScheduleService.addUserToBucket.mockResolvedValue(
          undefined,
        );

        // when
        const result = await service.updateSetting(mockUserId, updateDto);

        // then
        expect(result).toEqual({
          isActive: true,
          notifyTime: mockNotifyTime,
        });
        expect(
          prismaService.userNotificationSetting.upsert,
        ).toHaveBeenCalledWith({
          where: { userId: mockUserId },
          update: {
            isActive: true,
            fcmToken: mockFcmToken,
          },
          create: {
            userId: mockUserId,
            isActive: true,
            fcmToken: mockFcmToken,
          },
        });
        expect(scheduleService.addUserToBucket).toHaveBeenCalledWith(
          mockNotifyTime,
          mockUserId,
          mockFcmToken,
        );
      });

      test('기존 사용자의 알림 설정을 성공적으로 업데이트한다', async () => {
        // given
        const oldSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          isActive: false,
          fcmToken: null,
        };
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          oldSetting,
        );
        mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
          mockNotificationSetting,
        );
        mockNotificationScheduleService.addUserToBucket.mockResolvedValue(
          undefined,
        );

        // when
        const result = await service.updateSetting(mockUserId, updateDto);

        // then
        expect(result).toEqual({
          isActive: true,
          notifyTime: mockNotifyTime,
        });
        expect(scheduleService.addUserToBucket).toHaveBeenCalledWith(
          mockNotifyTime,
          mockUserId,
          mockFcmToken,
        );
      });

      test('알림 비활성화 시 Redis에서 제거한다', async () => {
        // given
        const deactivateDto: UpdateNotificationSettingRequestDto = {
          isActive: false,
        };
        const oldSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          isActive: true,
        };
        const newSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          isActive: false,
          fcmToken: null,
        };
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          oldSetting,
        );
        mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
          newSetting,
        );
        mockNotificationScheduleService.removeUserFromBucket.mockResolvedValue(
          undefined,
        );

        // when
        await service.updateSetting(mockUserId, deactivateDto);

        // then
        expect(scheduleService.removeUserFromBucket).toHaveBeenCalledWith(
          mockNotifyTime,
          mockUserId,
        );
        expect(scheduleService.addUserToBucket).not.toHaveBeenCalled();
      });

      test('알림 시간 변경 시 이전 시간대에서 제거하고 새 시간대에 추가한다', async () => {
        // given
        const newTime = '20:00:00';
        const updateDto: UpdateNotificationSettingRequestDto = {
          isActive: true,
          fcmToken: mockFcmToken,
        };
        const oldSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          notifyTime: mockNotifyTime,
        };
        const newSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          notifyTime: newTime,
        };
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          oldSetting,
        );
        mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
          newSetting,
        );
        mockNotificationScheduleService.removeUserFromBucket.mockResolvedValue(
          undefined,
        );
        mockNotificationScheduleService.addUserToBucket.mockResolvedValue(
          undefined,
        );

        // when
        await service.updateSetting(mockUserId, updateDto);

        // then
        expect(scheduleService.removeUserFromBucket).toHaveBeenCalledWith(
          mockNotifyTime,
          mockUserId,
        );
        expect(scheduleService.addUserToBucket).toHaveBeenCalledWith(
          newTime,
          mockUserId,
          mockFcmToken,
        );
      });
    });

    describe('실패 케이스', () => {
      test('알림 활성화 시 FCM 토큰이 없으면 FcmTokenRequiredException을 던진다', async () => {
        // given
        const invalidDto: UpdateNotificationSettingRequestDto = {
          isActive: true,
          fcmToken: undefined,
        };

        // when & then
        await expect(
          service.updateSetting(mockUserId, invalidDto),
        ).rejects.toThrow(FcmTokenRequiredException);
        expect(
          prismaService.userNotificationSetting.upsert,
        ).not.toHaveBeenCalled();
        expect(scheduleService.addUserToBucket).not.toHaveBeenCalled();
      });

      test('DB 업데이트 실패 시 에러를 전파한다', async () => {
        // given
        const dbError = new Error('Database connection failed');
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          null,
        );
        mockPrismaService.userNotificationSetting.upsert.mockRejectedValue(
          dbError,
        );

        // when & then
        await expect(
          service.updateSetting(mockUserId, updateDto),
        ).rejects.toThrow(dbError);
        expect(scheduleService.addUserToBucket).not.toHaveBeenCalled();
      });

      test('Redis 업데이트 실패 시 에러를 전파한다', async () => {
        // given
        const redisError = new Error('Redis connection failed');
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          null,
        );
        mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
          mockNotificationSetting,
        );
        mockNotificationScheduleService.addUserToBucket.mockRejectedValue(
          redisError,
        );

        // when & then
        await expect(
          service.updateSetting(mockUserId, updateDto),
        ).rejects.toThrow(redisError);
      });
    });
  });

  describe('updateNotifyTime', () => {
    const updateDto: UpdateNotifyTimeDto = {
      notifyTime: '20:00:00',
    };

    describe('성공 케이스', () => {
      test('알림 시간을 성공적으로 변경한다', async () => {
        // given
        const oldTime = '19:00:00';
        const newTime = '20:00:00';
        const existingSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          notifyTime: oldTime,
        };
        const updatedSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          notifyTime: newTime,
        };
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          existingSetting,
        );
        mockPrismaService.userNotificationSetting.update.mockResolvedValue(
          updatedSetting,
        );
        mockNotificationScheduleService.removeUserFromBucket.mockResolvedValue(
          undefined,
        );
        mockNotificationScheduleService.addUserToBucket.mockResolvedValue(
          undefined,
        );

        // when
        const result = await service.updateNotifyTime(mockUserId, updateDto);

        // then
        expect(result).toEqual({
          isActive: true,
          notifyTime: newTime,
        });
        expect(
          prismaService.userNotificationSetting.update,
        ).toHaveBeenCalledWith({
          where: { userId: mockUserId },
          data: { notifyTime: newTime },
        });
        expect(scheduleService.removeUserFromBucket).toHaveBeenCalledWith(
          oldTime,
          mockUserId,
        );
        expect(scheduleService.addUserToBucket).toHaveBeenCalledWith(
          newTime,
          mockUserId,
          mockFcmToken,
        );
      });

      test('같은 시간으로 변경 시 Redis 업데이트를 하지 않는다', async () => {
        // given
        const sameTime = '19:00:00';
        const sameTimeDto: UpdateNotifyTimeDto = {
          notifyTime: sameTime,
        };
        const existingSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          notifyTime: sameTime,
        };
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          existingSetting,
        );
        mockPrismaService.userNotificationSetting.update.mockResolvedValue(
          existingSetting,
        );

        // when
        await service.updateNotifyTime(mockUserId, sameTimeDto);

        // then
        expect(prismaService.userNotificationSetting.update).toHaveBeenCalled();
        expect(scheduleService.removeUserFromBucket).not.toHaveBeenCalled();
        expect(scheduleService.addUserToBucket).not.toHaveBeenCalled();
      });
    });

    describe('실패 케이스', () => {
      test('알림 설정이 존재하지 않으면 NotificationNotFoundException을 던진다', async () => {
        // given
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          null,
        );

        // when & then
        await expect(
          service.updateNotifyTime(mockUserId, updateDto),
        ).rejects.toThrow(NotificationNotFoundException);
        expect(
          prismaService.userNotificationSetting.update,
        ).not.toHaveBeenCalled();
        expect(scheduleService.removeUserFromBucket).not.toHaveBeenCalled();
      });

      test('알림이 비활성화 상태면 InactiveNotificationException을 던진다', async () => {
        // given
        const inactiveSetting: UserNotificationSetting = {
          ...mockNotificationSetting,
          isActive: false,
        };
        mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
          inactiveSetting,
        );

        // when & then
        await expect(
          service.updateNotifyTime(mockUserId, updateDto),
        ).rejects.toThrow(InactiveNotificationException);
        expect(
          prismaService.userNotificationSetting.update,
        ).not.toHaveBeenCalled();
        expect(scheduleService.removeUserFromBucket).not.toHaveBeenCalled();
      });
    });
  });

  describe('deactivate', () => {
    test('알림을 성공적으로 비활성화한다', async () => {
      // given
      mockPrismaService.userNotificationSetting.update.mockResolvedValue({
        ...mockNotificationSetting,
        isActive: false,
        fcmToken: null,
      });

      // when
      await service.deactivate(mockUserId);

      // then
      expect(prismaService.userNotificationSetting.update).toHaveBeenCalledWith(
        {
          where: { userId: mockUserId },
          data: {
            isActive: false,
            fcmToken: null,
          },
        },
      );
    });
  });

  describe('syncRedis (private 메서드 통합 테스트)', () => {
    test('이전 설정이 활성화였고 새 설정도 활성화인 경우 시간이 변경되면 Redis를 업데이트한다', async () => {
      // given
      const oldTime = '19:00:00';
      const newTime = '20:00:00';
      const updateDto: UpdateNotificationSettingRequestDto = {
        isActive: true,
        fcmToken: mockFcmToken,
      };
      const oldSetting: UserNotificationSetting = {
        ...mockNotificationSetting,
        notifyTime: oldTime,
      };
      const newSetting: UserNotificationSetting = {
        ...mockNotificationSetting,
        notifyTime: newTime,
      };
      mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
        oldSetting,
      );
      mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
        newSetting,
      );
      mockNotificationScheduleService.removeUserFromBucket.mockResolvedValue(
        undefined,
      );
      mockNotificationScheduleService.addUserToBucket.mockResolvedValue(
        undefined,
      );

      // when
      await service.updateSetting(mockUserId, updateDto);

      // then
      expect(scheduleService.removeUserFromBucket).toHaveBeenCalledWith(
        oldTime,
        mockUserId,
      );
      expect(scheduleService.addUserToBucket).toHaveBeenCalledWith(
        newTime,
        mockUserId,
        mockFcmToken,
      );
    });

    test('이전 설정이 없고 새로 활성화하는 경우 Redis에 추가만 한다', async () => {
      // given
      const updateDto: UpdateNotificationSettingRequestDto = {
        isActive: true,
        fcmToken: mockFcmToken,
      };
      mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
        null,
      );
      mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
        mockNotificationSetting,
      );
      mockNotificationScheduleService.addUserToBucket.mockResolvedValue(
        undefined,
      );

      // when
      await service.updateSetting(mockUserId, updateDto);

      // then
      expect(scheduleService.removeUserFromBucket).not.toHaveBeenCalled();
      expect(scheduleService.addUserToBucket).toHaveBeenCalledWith(
        mockNotifyTime,
        mockUserId,
        mockFcmToken,
      );
    });

    test('이전 설정이 비활성화이고 새로 활성화하는 경우 Redis에 추가만 한다', async () => {
      // given
      const updateDto: UpdateNotificationSettingRequestDto = {
        isActive: true,
        fcmToken: mockFcmToken,
      };
      const oldSetting: UserNotificationSetting = {
        ...mockNotificationSetting,
        isActive: false,
        fcmToken: null,
      };
      mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
        oldSetting,
      );
      mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
        mockNotificationSetting,
      );
      mockNotificationScheduleService.addUserToBucket.mockResolvedValue(
        undefined,
      );

      // when
      await service.updateSetting(mockUserId, updateDto);

      // then
      expect(scheduleService.removeUserFromBucket).not.toHaveBeenCalled();
      expect(scheduleService.addUserToBucket).toHaveBeenCalledWith(
        mockNotifyTime,
        mockUserId,
        mockFcmToken,
      );
    });

    test('이전 설정이 활성화이고 비활성화하는 경우 Redis에서 제거만 한다', async () => {
      // given
      const updateDto: UpdateNotificationSettingRequestDto = {
        isActive: false,
      };
      const oldSetting: UserNotificationSetting = {
        ...mockNotificationSetting,
        isActive: true,
      };
      const newSetting: UserNotificationSetting = {
        ...mockNotificationSetting,
        isActive: false,
        fcmToken: null,
      };
      mockPrismaService.userNotificationSetting.findUnique.mockResolvedValue(
        oldSetting,
      );
      mockPrismaService.userNotificationSetting.upsert.mockResolvedValue(
        newSetting,
      );
      mockNotificationScheduleService.removeUserFromBucket.mockResolvedValue(
        undefined,
      );

      // when
      await service.updateSetting(mockUserId, updateDto);

      // then
      expect(scheduleService.removeUserFromBucket).toHaveBeenCalledWith(
        mockNotifyTime,
        mockUserId,
      );
      expect(scheduleService.addUserToBucket).not.toHaveBeenCalled();
    });
  });
});
