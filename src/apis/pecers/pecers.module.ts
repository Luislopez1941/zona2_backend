import { Module } from '@nestjs/common';
import { PecersService } from './pecers.service';
import { PecersController } from './pecers.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PecersController],
  providers: [PecersService],
})
export class PecersModule {}
