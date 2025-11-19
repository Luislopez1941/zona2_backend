import { Test, TestingModule } from '@nestjs/testing';
import { SecUsersController } from './sec_users.controller';
import { SecUsersService } from './sec_users.service';

describe('SecUsersController', () => {
  let controller: SecUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecUsersController],
      providers: [SecUsersService],
    }).compile();

    controller = module.get<SecUsersController>(SecUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
