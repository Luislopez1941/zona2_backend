import { Test, TestingModule } from '@nestjs/testing';
import { FolloersService } from './folloers.service';

describe('FolloersService', () => {
  let service: FolloersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolloersService],
    }).compile();

    service = module.get<FolloersService>(FolloersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
