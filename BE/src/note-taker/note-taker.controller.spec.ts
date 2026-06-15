import { Test, TestingModule } from '@nestjs/testing';
import { NoteTakerController } from './note-taker.controller.js';

describe('NoteTakerController', () => {
  let controller: NoteTakerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NoteTakerController],
    }).compile();

    controller = module.get<NoteTakerController>(NoteTakerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
