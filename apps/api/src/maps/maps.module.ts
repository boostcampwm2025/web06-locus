import { Module } from '@nestjs/common';
import { MapsController } from './maps.controller';
import { MapsService } from './reverse-geocoding.service';

@Module({
  imports: [],
  controllers: [MapsController],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule {}
