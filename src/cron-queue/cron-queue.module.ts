// src/cron-queue/cron-queue.module.ts
import { Module } from '@nestjs/common';
import { CronQueueService } from './cron-queue.service';
import { CronQueueController } from './cron-queue.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [CronQueueController],
  providers: [CronQueueService],
})
export class CronQueueModule {}