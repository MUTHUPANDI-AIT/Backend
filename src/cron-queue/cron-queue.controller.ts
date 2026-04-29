import { Controller, Post, Body } from '@nestjs/common';
import { CronQueueService } from './cron-queue.service';

@Controller('cron-queue')
export class CronQueueController {
  constructor(private readonly cronService: CronQueueService) {}

  @Post('add-job')
  async addJob(@Body('email') email: string) {
    return this.cronService.addJob(email);
  }
}
