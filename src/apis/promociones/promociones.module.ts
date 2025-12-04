import { Module } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { PromocionesController } from './promociones.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { StripeService } from '../../common/services/stripe.service';

@Module({
  imports: [PrismaModule],
  controllers: [PromocionesController],
  providers: [PromocionesService, StripeService],
  exports: [PromocionesService],
})
export class PromocionesModule {}
