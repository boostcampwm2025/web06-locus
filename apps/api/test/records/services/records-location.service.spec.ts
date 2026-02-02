import { Test, TestingModule } from '@nestjs/testing';
import { RecordLocationService } from '@/records/services/records-location.service';
import { MapsService } from '@/maps/maps.service';
import { LocationNotFoundException } from '@/records/exceptions/record.exceptions';
import { Record } from '@prisma/client';

describe('RecordLocationService', () => {
  let service: RecordLocationService;

  const mockMapsService = {
    getAddressFromCoordinates: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordLocationService,
        {
          provide: MapsService,
          useValue: mockMapsService,
        },
      ],
    }).compile();

    service = module.get<RecordLocationService>(RecordLocationService);
  });

  describe('getLocationInfo', () => {
    test('좌표로 주소 정보를 조회하여 LocationInfo를 반환해야 한다', async () => {
      // given
      const latitude = 37.5665;
      const longitude = 126.978;
      const mockAddress = {
        name: '서울시청',
        address: '서울특별시 중구 세종대로 110',
      };

      mockMapsService.getAddressFromCoordinates.mockResolvedValue(mockAddress);

      // when
      const result = await service.getLocationInfo(latitude, longitude);

      // then
      expect(mockMapsService.getAddressFromCoordinates).toHaveBeenCalledWith(
        latitude,
        longitude,
      );
      expect(result).toEqual({
        name: '서울시청',
        address: '서울특별시 중구 세종대로 110',
      });
    });

    test('지도 서비스에서 주소를 찾지 못하면 null 값을 포함한 LocationInfo를 반환해야 한다', async () => {
      // given
      const latitude = 0;
      const longitude = 0;
      const mockAddress = {
        name: null,
        address: null,
      };

      mockMapsService.getAddressFromCoordinates.mockResolvedValue(mockAddress);

      // when
      const result = await service.getLocationInfo(latitude, longitude);

      // then
      expect(result).toEqual({
        name: null,
        address: null,
      });
    });

    test('지도 서비스 호출이 실패하면 예외를 던져야 한다', async () => {
      // given
      const latitude = 37.5665;
      const longitude = 126.978;
      const error = new Error('Maps API error');

      mockMapsService.getAddressFromCoordinates.mockRejectedValue(error);

      // when & then
      await expect(
        service.getLocationInfo(latitude, longitude),
      ).rejects.toThrow('Maps API error');
    });

    test('유효하지 않은 좌표가 전달되어도 지도 서비스를 호출해야 한다', async () => {
      // given
      const latitude = 999;
      const longitude = -999;
      const mockAddress = {
        name: null,
        address: null,
      };

      mockMapsService.getAddressFromCoordinates.mockResolvedValue(mockAddress);

      // when
      await service.getLocationInfo(latitude, longitude);

      // then
      expect(mockMapsService.getAddressFromCoordinates).toHaveBeenCalledWith(
        latitude,
        longitude,
      );
    });
  });

  describe('updateRecordLocation', () => {
    test('레코드의 위치 정보를 업데이트하고 업데이트된 레코드를 반환해야 한다', async () => {
      // given
      const recordId = 100n;
      const longitude = 126.978;
      const latitude = 37.5665;

      const mockUpdatedRecord = {
        id: 100n,
        publicId: 'rec_123',
        title: '서울 여행',
        content: '서울시청 방문',
        locationName: '서울시청',
        locationAddress: '서울특별시 중구 세종대로 110',
        longitude: 126.978,
        latitude: 37.5665,
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockTx = {
        $queryRaw: jest.fn().mockResolvedValue([mockUpdatedRecord]),
      } as any;

      // when
      const result = await service.updateRecordLocation(
        mockTx,
        recordId,
        longitude,
        latitude,
      );

      // then
      expect(mockTx.$queryRaw).toHaveBeenCalledTimes(1);
      expect(mockTx.$queryRaw).toHaveBeenCalledWith(expect.anything());
      expect(result).toEqual(mockUpdatedRecord);
      expect(result.longitude).toBe(longitude);
      expect(result.latitude).toBe(latitude);
    });
  });

  describe('getRecordWithLocation', () => {
    test('레코드 정보와 좌표를 결합하여 RecordModel을 반환해야 한다', async () => {
      // given
      const recordId = 100n;
      const record: Record = {
        id: 100n,
        publicId: 'rec_123',
        userId: 1n,
        title: '강남 카페',
        content: '좋은 카페',
        locationName: '스타벅스 강남점',
        locationAddress: '서울특별시 강남구',
        isFavorite: true,
        connectionsCount: 5,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockLocationData = [
        {
          longitude: 127.0276,
          latitude: 37.4979,
        },
      ];

      const mockTx = {
        $queryRaw: jest.fn().mockResolvedValue(mockLocationData),
      } as any;

      // when
      const result = await service.getRecordWithLocation(
        mockTx,
        recordId,
        record,
      );

      // then
      expect(mockTx.$queryRaw).toHaveBeenCalledTimes(1);
      expect(mockTx.$queryRaw).toHaveBeenCalledWith(expect.anything());
      expect(result).toEqual({
        id: 100n,
        publicId: 'rec_123',
        title: '강남 카페',
        content: '좋은 카페',
        locationName: '스타벅스 강남점',
        locationAddress: '서울특별시 강남구',
        isFavorite: true,
        connectionsCount: 5,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        longitude: 127.0276,
        latitude: 37.4979,
      });
      expect(result).not.toHaveProperty('userId');
    });

    test('위치 데이터가 없으면 LocationNotFoundException을 던져야 한다', async () => {
      // given
      const recordId = 100n;
      const record: Record = {
        id: 100n,
        publicId: 'rec_123',
        userId: 1n,
        title: '테스트',
        content: '내용',
        locationName: '장소',
        locationAddress: '주소',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockTx = {
        $queryRaw: jest.fn().mockResolvedValue([]),
      } as any;

      // when & then
      await expect(
        service.getRecordWithLocation(mockTx, recordId, record),
      ).rejects.toThrow(LocationNotFoundException);

      await expect(
        service.getRecordWithLocation(mockTx, recordId, record),
      ).rejects.toThrow('기록의 장소를 찾을 수 없습니다.');
    });

    test('userId 필드는 결과에서 제외되어야 한다', async () => {
      // given
      const recordId = 100n;
      const record: Record = {
        id: 100n,
        publicId: 'rec_123',
        userId: 999n,
        title: '테스트',
        content: '내용',
        locationName: '장소',
        locationAddress: '주소',
        isFavorite: false,
        connectionsCount: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      };

      const mockLocationData = [
        {
          longitude: 126.978,
          latitude: 37.5665,
        },
      ];

      const mockTx = {
        $queryRaw: jest.fn().mockResolvedValue(mockLocationData),
      } as any;

      // when
      const result = await service.getRecordWithLocation(
        mockTx,
        recordId,
        record,
      );

      // then
      expect(result).not.toHaveProperty('userId');
      expect(result.id).toBe(100n);
      expect(result.publicId).toBe('rec_123');
    });
  });
});
