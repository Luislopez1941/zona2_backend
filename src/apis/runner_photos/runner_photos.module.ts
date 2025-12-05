import { Module } from '@nestjs/common';
import { RunnerPhotosService } from './runner_photos.service';
import { RunnerPhotosController } from './runner_photos.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RunnerPhotosController],
  providers: [RunnerPhotosService],
})
export class RunnerPhotosModule {}
