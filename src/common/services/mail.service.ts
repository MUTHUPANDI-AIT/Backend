import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as nodemailer from 'nodemailer';
import { Category } from '../../categories/schemas/category.schema';
import { Product } from '../../products/schemas/product.schema';

// Define the shape of the data being sent to the queue
export interface MailJobData {
  operation: 'create' | 'update' | 'delete';
  type: 'category' | 'product';
  data: Category | Product;
  recipientEmail: string;
  images?: string[];
}

@Injectable()
export class MailService {
  public transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectQueue('mail') private mailQueue: Queue,
  ) {
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    this.transporter.verify((error) => {
      if (error) {
        console.error('Mail transporter verification failed:', error);
      } else {
        console.log('Mail transporter is ready');
      }
    });
  }

  async sendCategoryNotification(
    operation: 'create' | 'update' | 'delete',
    category: Category,
    recipientEmail: string,
    images: string[] = [],
  ) {
    await this.addToQueue(
      'category',
      operation,
      category,
      recipientEmail,
      images,
    );
  }

  async sendProductNotification(
    operation: 'create' | 'update' | 'delete',
    product: Product,
    recipientEmail: string,
    images: string[] = [],
  ) {
    await this.addToQueue(
      'product',
      operation,
      product,
      recipientEmail,
      images,
    );
  }

  private async addToQueue(
    type: 'category' | 'product',
    operation: string,
    data: Category | Product,
    recipientEmail: string,
    images: string[],
  ) {
    if (!recipientEmail) {
      throw new Error('Recipient email is required.');
    }

    // Pushes the job to Redis and returns immediately
    await this.mailQueue.add({
      operation,
      type,
      data,
      recipientEmail,
      images,
    });
    console.log(`${type} notification added to queue`);
  }

  public generateProductHtml(operation: string, product: Product): string {
    const themes = {
      create: { color: '#28a745', bg: '#d4edda' },
      update: { color: '#007bff', bg: '#cce7ff' },
      delete: { color: '#dc3545', bg: '#f8d7da' },
    };
    const theme = themes[operation] || themes.update;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${theme.bg}; padding: 20px; border-radius: 8px;">
        <h2 style="color: ${theme.color};">Product ${operation.toUpperCase()}</h2>
        <p><strong>Name:</strong> ${product.name}</p>
        <p><strong>Description:</strong> ${product.description || 'N/A'}</p>
        <p><strong>Price:</strong> RS ${product.price || 'N/A'}</p>
        <p><strong>Stock:</strong> ${product.stock || 'N/A'}</p>
      </div>
    `;
  }

  public generateCategoryHtml(operation: string, category: Category): string {
    const themes = {
      create: { color: '#28a745', bg: '#d4edda' },
      update: { color: '#007bff', bg: '#cce7ff' },
      delete: { color: '#dc3545', bg: '#f8d7da' },
    };
    const theme = themes[operation] || themes.update;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${theme.bg}; padding: 20px; border-radius: 8px;">
        <h2 style="color: ${theme.color};">Category ${operation.toUpperCase()}</h2>
        <p><strong>Name:</strong> ${category.name}</p>
        <p><strong>Description:</strong> ${category.description || 'N/A'}</p>
      </div>
    `;
  }
}
