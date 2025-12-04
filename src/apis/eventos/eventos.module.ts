import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { StripeService } from '../../common/services/stripe.service';

@Module({
  imports: [PrismaModule],
  controllers: [EventosController],
  providers: [EventosService, StripeService],
  exports: [EventosService],
})
export class EventosModule {}
