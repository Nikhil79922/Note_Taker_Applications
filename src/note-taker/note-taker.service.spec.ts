import { Test, TestingModule } from '@nestjs/testing';
import { NoteTakerService } from './note-taker.service';

describe('NoteTakerService', () => {
  let service: NoteTakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoteTakerService],
    }).compile();

    service = module.get<NoteTakerService>(NoteTakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
