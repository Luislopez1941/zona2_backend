import { Module } from '@nestjs/common';
import { ZonasActividadesService } from './zonas_actividades.service';
import { ZonasActividadesController } from './zonas_actividades.controller';

@Module({
  controllers: [ZonasActividadesController],
  providers: [ZonasActividadesService],
})
export class ZonasActividadesModule {}
