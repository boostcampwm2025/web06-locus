import { Module } from '@nestjs/common';
import { RecordsModule } from '@/records/records.module';
import { DuckController } from './duck.controller';
import { DuckService } from './duck.service';
import { JwtModule } from '@/jwt/jwt.module';
import { DuckConsumer } from './duck.consumer';
import { NcpAiService } from './ncp-ai.service';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [RecordsModule, JwtModule, UsersModule],
  controllers: [DuckController, DuckConsumer],
  providers: [DuckService, NcpAiService],
  exports: [DuckService],
})
export class DuckModule {}
