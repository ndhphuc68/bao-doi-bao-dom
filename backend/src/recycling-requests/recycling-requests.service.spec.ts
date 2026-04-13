import { Test, TestingModule } from '@nestjs/testing';
import { RecyclingRequestsService } from './recycling-requests.service';

describe('RecyclingRequestsService', () => {
  let service: RecyclingRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecyclingRequestsService],
    }).compile();

    service = module.get<RecyclingRequestsService>(RecyclingRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
