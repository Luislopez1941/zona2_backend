import { Test, TestingModule } from '@nestjs/testing';
import { PecersController } from './pecers.controller';
import { PecersService } from './pecers.service';

describe('PecersController', () => {
  let controller: PecersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PecersController],
      providers: [PecersService],
    }).compile();

    controller = module.get<PecersController>(PecersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
