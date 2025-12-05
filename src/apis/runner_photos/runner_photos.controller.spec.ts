import { Test, TestingModule } from '@nestjs/testing';
import { RunnerPhotosController } from './runner_photos.controller';
import { RunnerPhotosService } from './runner_photos.service';

describe('RunnerPhotosController', () => {
  let controller: RunnerPhotosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RunnerPhotosController],
      providers: [RunnerPhotosService],
    }).compile();

    controller = module.get<RunnerPhotosController>(RunnerPhotosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
