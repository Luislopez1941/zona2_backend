import { Test, TestingModule } from '@nestjs/testing';
import { ZonasActividadesController } from './zonas_actividades.controller';
import { ZonasActividadesService } from './zonas_actividades.service';

describe('ZonasActividadesController', () => {
  let controller: ZonasActividadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZonasActividadesController],
      providers: [ZonasActividadesService],
    }).compile();

    controller = module.get<ZonasActividadesController>(ZonasActividadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
