import { Module } from '@nestjs/common';
import { PecersService } from './pecers.service';
import { PecersController } from './pecers.controller';

@Module({
  controllers: [PecersController],
  providers: [PecersService],
})
export class PecersModule {}
