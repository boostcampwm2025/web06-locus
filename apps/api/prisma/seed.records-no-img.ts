import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker/locale/ko';
import 'dotenv/config';

// ============================================
// 이미지 없는 기록 더미 데이터를 생산해요.
// 위/경도는 별도 오프셋으로 계산해서 오차가 있으나,
// 국내에서는 10% 내외로 예상해요.
// ============================================
const USER_ID = 1n; // 사용할 유저 ID
const CENTER = { lat: 37.5796, lng: 126.977 }; // 중심 좌표
const RECORD_COUNT = 20; // 생성할 레코드 수
const RADIUS_METERS = 30; // 분포 반경 (미터)
// ============================================

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// 미터를 위도/경도 오프셋으로 변환 (대략적 계산)
const metersToLatOffset = (meters: number) => meters / 111320;
const metersToLngOffset = (meters: number, lat: number) =>
  meters / (111320 * Math.cos((lat * Math.PI) / 180));

function generateRecordData() {
  const latOffset = metersToLatOffset(RADIUS_METERS);
  const lngOffset = metersToLngOffset(RADIUS_METERS, CENTER.lat);

  return Array.from({ length: RECORD_COUNT }, () => ({
    title: faker.lorem.sentence({ min: 2, max: 5 }),
    content: faker.lorem.paragraph(),
    latitude:
      CENTER.lat + faker.number.float({ min: -latOffset, max: latOffset }),
    longitude:
      CENTER.lng + faker.number.float({ min: -lngOffset, max: lngOffset }),
  }));
}

async function seed() {
  console.log('Seeding started...');
  console.log(`Center: (${CENTER.lat}, ${CENTER.lng})`);
  console.log(`User ID: ${USER_ID}`);
  console.log(`Record count: ${RECORD_COUNT}`);

  faker.seed(42); // 재현 가능한 데이터

  const records = generateRecordData();

  for (const record of records) {
    // 1. Record 생성 (location 제외)
    const created = await prisma.record.create({
      data: {
        userId: USER_ID,
        title: record.title,
        content: record.content,
        locationName: null,
        locationAddress: null,
        isFavorite: false,
      },
    });

    // 2. location 업데이트 (PostGIS)
    await prisma.$executeRaw`
      UPDATE locus.records
      SET location = ST_SetSRID(ST_MakePoint(${record.longitude}, ${record.latitude}), 4326)
      WHERE id = ${created.id}
    `;

    console.log(
      `  Created: "${record.title}" at (${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)})`,
    );
  }

  console.log(`\n🎉 Seeding completed! ${RECORD_COUNT} records created.`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
