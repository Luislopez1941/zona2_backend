import { Test, TestingModule } from '@nestjs/testing';
import { CiudadesMexicoController } from './ciudades_mexico.controller';
import { CiudadesMexicoService } from './ciudades_mexico.service';

describe('CiudadesMexicoController', () => {
  let controller: CiudadesMexicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CiudadesMexicoController],
      providers: [CiudadesMexicoService],
    }).compile();

    controller = module.get<CiudadesMexicoController>(CiudadesMexicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
