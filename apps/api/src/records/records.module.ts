import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { ReverseGeocodingService } from './services/reverse-geocoding.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecordsController],
  providers: [RecordsService, ReverseGeocodingService],
  exports: [RecordsService],
})
export class RecordsModule {}
