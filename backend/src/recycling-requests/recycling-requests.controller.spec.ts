import { Test, TestingModule } from '@nestjs/testing';
import { RecyclingRequestsController } from './recycling-requests.controller';

describe('RecyclingRequestsController', () => {
  let controller: RecyclingRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecyclingRequestsController],
    }).compile();

    controller = module.get<RecyclingRequestsController>(RecyclingRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
