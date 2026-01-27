import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
