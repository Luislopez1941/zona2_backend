import { Module } from '@nestjs/common';
import { ActividadZonasService } from './actividad_zonas.service';
import { ActividadZonasController } from './actividad_zonas.controller';

@Module({
  controllers: [ActividadZonasController],
  providers: [ActividadZonasService],
})
export class ActividadZonasModule {}
