import { Test, TestingModule } from '@nestjs/testing';
import { RunnerPhotosService } from './runner_photos.service';

describe('RunnerPhotosService', () => {
  let service: RunnerPhotosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RunnerPhotosService],
    }).compile();

    service = module.get<RunnerPhotosService>(RunnerPhotosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
