import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImageProcessingService } from './image-processing.service';
import { ObjectStorageService } from './object-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ImagesService, ImageProcessingService, ObjectStorageService],
  exports: [ImagesService, ImageProcessingService, ObjectStorageService],
})
export class ImagesModule {}
