import { Test, TestingModule } from '@nestjs/testing';
import { EstablecimientosController } from './establecimientos.controller';
import { EstablecimientosService } from './establecimientos.service';

describe('EstablecimientosController', () => {
  let controller: EstablecimientosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstablecimientosController],
      providers: [EstablecimientosService],
    }).compile();

    controller = module.get<EstablecimientosController>(EstablecimientosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
