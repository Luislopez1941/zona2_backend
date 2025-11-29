import { Test, TestingModule } from '@nestjs/testing';
import { EstadosMexicoController } from './estados_mexico.controller';
import { EstadosMexicoService } from './estados_mexico.service';

describe('EstadosMexicoController', () => {
  let controller: EstadosMexicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadosMexicoController],
      providers: [EstadosMexicoService],
    }).compile();

    controller = module.get<EstadosMexicoController>(EstadosMexicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
