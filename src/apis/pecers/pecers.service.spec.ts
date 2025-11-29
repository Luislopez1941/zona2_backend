import { Test, TestingModule } from '@nestjs/testing';
import { PecersService } from './pecers.service';

describe('PecersService', () => {
  let service: PecersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PecersService],
    }).compile();

    service = module.get<PecersService>(PecersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
