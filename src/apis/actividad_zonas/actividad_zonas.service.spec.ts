import { Test, TestingModule } from '@nestjs/testing';
import { ActividadZonasService } from './actividad_zonas.service';

describe('ActividadZonasService', () => {
  let service: ActividadZonasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActividadZonasService],
    }).compile();

    service = module.get<ActividadZonasService>(ActividadZonasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
