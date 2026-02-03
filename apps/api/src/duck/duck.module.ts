import { Module } from '@nestjs/common';
import { RecordsModule } from '@/records/records.module';
import { DuckController } from './duck.controller';
import { DuckService } from './duck.service';
import { JwtModule } from '@/jwt/jwt.module';
import { DuckConsumer } from './duck.consumer';

@Module({
  imports: [RecordsModule, JwtModule],
  controllers: [DuckController, DuckConsumer],
  providers: [DuckService],
  exports: [DuckService],
})
export class DuckModule {}
