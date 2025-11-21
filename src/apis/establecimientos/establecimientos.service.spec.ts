import { Test, TestingModule } from '@nestjs/testing';
import { EstablecimientosService } from './establecimientos.service';

describe('EstablecimientosService', () => {
  let service: EstablecimientosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstablecimientosService],
    }).compile();

    service = module.get<EstablecimientosService>(EstablecimientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
