import { Test, TestingModule } from '@nestjs/testing';
import { EstadosMexicoService } from './estados_mexico.service';

describe('EstadosMexicoService', () => {
  let service: EstadosMexicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadosMexicoService],
    }).compile();

    service = module.get<EstadosMexicoService>(EstadosMexicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
