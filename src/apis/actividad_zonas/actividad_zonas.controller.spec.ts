import { Test, TestingModule } from '@nestjs/testing';
import { ActividadZonasController } from './actividad_zonas.controller';
import { ActividadZonasService } from './actividad_zonas.service';

describe('ActividadZonasController', () => {
  let controller: ActividadZonasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActividadZonasController],
      providers: [ActividadZonasService],
    }).compile();

    controller = module.get<ActividadZonasController>(ActividadZonasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
