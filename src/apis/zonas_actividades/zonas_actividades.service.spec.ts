import { Test, TestingModule } from '@nestjs/testing';
import { ZonasActividadesService } from './zonas_actividades.service';

describe('ZonasActividadesService', () => {
  let service: ZonasActividadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZonasActividadesService],
    }).compile();

    service = module.get<ZonasActividadesService>(ZonasActividadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
