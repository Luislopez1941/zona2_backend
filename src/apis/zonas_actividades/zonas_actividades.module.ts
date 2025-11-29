import { Module } from '@nestjs/common';
import { ZonasActividadesService } from './zonas_actividades.service';
import { ZonasActividadesController } from './zonas_actividades.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ZonasActividadesController],
  providers: [ZonasActividadesService],
})
export class ZonasActividadesModule {}
