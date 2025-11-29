import { Test, TestingModule } from '@nestjs/testing';
import { FolloersController } from './folloers.controller';
import { FolloersService } from './folloers.service';

describe('FolloersController', () => {
  let controller: FolloersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FolloersController],
      providers: [FolloersService],
    }).compile();

    controller = module.get<FolloersController>(FolloersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
