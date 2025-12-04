import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { StripeService } from '../../common/services/stripe.service';

@Module({
  imports: [PrismaModule],
  controllers: [EquiposController],
  providers: [EquiposService, StripeService],
  exports: [EquiposService],
})
export class EquiposModule {}
