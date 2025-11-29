import { Test, TestingModule } from '@nestjs/testing';
import { CiudadesMexicoService } from './ciudades_mexico.service';

describe('CiudadesMexicoService', () => {
  let service: CiudadesMexicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CiudadesMexicoService],
    }).compile();

    service = module.get<CiudadesMexicoService>(CiudadesMexicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
