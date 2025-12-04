import { Module } from '@nestjs/common';
import { PecersService } from './pecers.service';
import { PecersController } from './pecers.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { StripeService } from '../../common/services/stripe.service';

@Module({
  imports: [PrismaModule],
  controllers: [PecersController],
  providers: [PecersService, StripeService],
})
export class PecersModule {}
