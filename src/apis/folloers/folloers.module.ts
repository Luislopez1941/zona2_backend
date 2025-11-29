import { Module } from '@nestjs/common';
import { FolloersService } from './folloers.service';
import { FolloersController } from './folloers.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FolloersController],
  providers: [FolloersService],
  exports: [FolloersService],
})
export class FolloersModule {}
