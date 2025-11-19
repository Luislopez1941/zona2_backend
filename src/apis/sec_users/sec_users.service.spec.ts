import { Test, TestingModule } from '@nestjs/testing';
import { SecUsersService } from './sec_users.service';

describe('SecUsersService', () => {
  let service: SecUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecUsersService],
    }).compile();

    service = module.get<SecUsersService>(SecUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
