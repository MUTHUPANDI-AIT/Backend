import { Test, TestingModule } from '@nestjs/testing';
import { CronQueueController } from './cron-queue.controller';

describe('CronQueueController', () => {
  let controller: CronQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CronQueueController],
    }).compile();

    controller = module.get<CronQueueController>(CronQueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
