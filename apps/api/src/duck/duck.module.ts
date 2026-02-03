import { Module } from '@nestjs/common';
import { RecordsModule } from '@/records/records.module';
import { DuckController } from './duck.controller';
import { DuckService } from './duck.service';
import { JwtModule } from '@/jwt/jwt.module';

@Module({
  imports: [RecordsModule, JwtModule],
  controllers: [DuckController],
  providers: [DuckService],
  exports: [DuckService],
})
export class DuckModule {}
