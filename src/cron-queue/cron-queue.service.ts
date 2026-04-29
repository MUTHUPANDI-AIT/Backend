// src/cron-queue/cron-queue.service.ts
import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

@Injectable()
export class CronQueueService {
  private queue: Queue;

  constructor() {
    const connection = new Redis();
    this.queue = new Queue('emailQueue', { connection });
  }

  // @Cron('* * * * *')
  // async handleCron() {
  //   console.log('Cron running...');
  //   await this.addJob('cron@example.com');
  // }

  // 📌 Queue add function
  async addJob(email: string) {
    await this.queue.add('sendEmail', { email });
    return `Job added for ${email}`;
  }
}
