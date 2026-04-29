import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { USER_MESSAGES } from '../users/constants/user.constants';
import { MailService } from '../common/services/mail.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  private async getProductUserEmail(userId: string) {
    const user = await this.usersService.findOne(userId);
    return user?.email || null;
  }

  // CRON: auto-increment stock
  @Cron('*/10 * * * *')
  async addStockAutomatically() {
    try {
      const products = await this.productModel.find();

      for (const product of products) {
        product.stock = (product.stock || 0) + 1;
        await product.save();

        console.log(
          `Stock updated: ${product.name} → ${product.stock} (${new Date().toISOString()})`,
        );
      }
    } catch (error) {
      console.error('Cron stock update failed:', error);
    }
  }

  // CREATE
  async create(images: string[], dto: CreateProductDto, userId: string) {
    const product = await this.productModel.create({ ...dto, images, userId });

    const email = await this.getProductUserEmail(userId);
    if (email) {
      await this.mailService.sendProductNotification('create', product, email, images);
    }

    return product;
  }

  // GET ALL (optimized filtering)
  async findAll(query: any) {
    try {
      const filter: any = {};

      if (query.name) {
        filter.name = { $regex: query.name, $options: 'i' };
      }

      if (query.stock !== undefined) {
        const stockValue = query.stock;

        if (stockValue === 'true' || stockValue === true) {
          filter.stock = { $gte: 1 };
        } else if (stockValue === 'false' || stockValue === false) {
          filter.stock = 0;
        } else if (!Number.isNaN(Number(stockValue))) {
          const parsedStock = Number(stockValue);
          filter.stock = parsedStock === 0 ? 0 : { $gte: parsedStock };
        }
      }

      if (query.startDate || query.endDate) {
        filter.createdAt = {
          ...(query.startDate && { $gte: new Date(query.startDate) }),
          ...(query.endDate && { $lte: new Date(query.endDate) }),
        };
      }

      // Pagination
      let page = Math.max(Number(query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(query.limit) || 16, 1), 100);

      const total = await this.productModel.countDocuments(filter);
      const totalPages = Math.max(Math.ceil(total / limit), 1);

      // ✅ Clamp page
      if (page > totalPages) page = totalPages;

      const skip = (page - 1) * limit;

      const products = await this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        data: products,
        total,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw error;
    }
  }

  // GET ONE
  async findOne(id: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      return { message: USER_MESSAGES.USER_NOT_FOUND };
    }

    return product;
  }

  // UPDATE
  async update(id: string, dto: UpdateProductDto, images?: string[]) {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      { ...dto, ...(images && { images }) },
      { new: true },
    );

    if (!updatedProduct) {
      return { message: USER_MESSAGES.USER_NOT_FOUND };
    }

    const email = await this.getProductUserEmail(updatedProduct.userId);
    if (email) {
      await this.mailService.sendProductNotification('update', updatedProduct, email, images);
    }

    return updatedProduct;
  }

  // DELETE
  async delete(id: string) {
    const deletedProduct = await this.productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return { message: USER_MESSAGES.USER_NOT_FOUND };
    }

    const email = await this.getProductUserEmail(deletedProduct.userId);
    if (email) {
      await this.mailService.sendProductNotification('delete', deletedProduct, email);
    }

    return {
      message: `${deletedProduct.name} removed successfully`,
    };
  }
}