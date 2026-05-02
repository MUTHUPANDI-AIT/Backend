import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { MailService, MailJobData } from './mail.service';
import { Category } from '../../categories/schemas/category.schema';
import { Product } from '../../products/schemas/product.schema';

@Injectable()
@Processor('mail')
export class MailProcessor {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  @Process()
  async handleMailJob(job: Job<MailJobData>) {
    const { operation, type, data, recipientEmail, images } = job.data;

    // 1. Generate Content using the Service methods
    const html =
      type === 'category'
        ? this.mailService.generateCategoryHtml(operation, data as Category)
        : this.mailService.generateProductHtml(operation, data as Product);

    const subject = `${type.charAt(0).toUpperCase() + type.slice(1)} ${operation.toUpperCase()} Notification`;

    // 2. Prepare Attachments
    const attachments = images?.map((image) => {
      if (typeof image === 'string') {
        return {
          filename: image.split('/').pop(),
          path: image,
        };
      }

      return {
        filename: image.filename,
        content: Buffer.from(image.data as unknown as ArrayBuffer),
        contentType: image.mimetype,
      };
    });

    // 3. Send the actual email via SMTP
    try {
      await this.mailService.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER'),
        to: recipientEmail,
        subject,
        html,
        attachments,
      });
    } catch (error) {
      console.error(`Failed to send email for job ${job.id}:`, error);
      throw error; // Throwing allows Bull to attempt a retry
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log(`Mail job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    console.error(`Mail job ${job.id} failed: ${error.message}`);
  }
}
