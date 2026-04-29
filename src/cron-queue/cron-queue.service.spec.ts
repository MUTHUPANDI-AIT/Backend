import { Test, TestingModule } from '@nestjs/testing';
import { CronQueueService } from './cron-queue.service';

describe('CronQueueService', () => {
  let service: CronQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronQueueService],
    }).compile();

    service = module.get<CronQueueService>(CronQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
