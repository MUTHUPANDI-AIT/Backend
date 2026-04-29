
import { Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis();

new Worker(
  'emailQueue',
  async (job) => {
    console.log('Processing job:', job.data);
  },
  { connection }
);