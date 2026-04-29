import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MailService } from '../common/services';
import { UsersService } from '../users/users.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  private async getCategoryUserEmail(userId: string) {
    const user = await this.usersService.findOne(userId);
    return user?.email;
  }

  // CREATE
  async create(images: string[], dto: CreateCategoryDto, userId: string) {
    try {
      const category = await this.categoryModel.create({ ...dto, images, userId });
      const recipientEmail = await this.getCategoryUserEmail(userId);
      await this.mailService.sendCategoryNotification('create', category, recipientEmail, images);
      return category;
    } catch (error) {
      throw error;
    }
  }

  // GET ALL with filters and pagination
  async findAll(query: any) {
    try {
      const filter: any = {};
      if (query.name) {
        filter.name = { $regex: query.name, $options: 'i' };
      }
      if (query.startDate && query.endDate) {
        filter.createdAt = {
          $gte: new Date(query.startDate),
          $lte: new Date(query.endDate),
        };
      }

      const page = Math.max(Number(query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
      const skip = (page - 1) * limit;
      const total = await this.categoryModel.countDocuments(filter);

      const categories = await this.categoryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

      return {
        data: categories,
        total,
        currentPage: page,
        totalPages: Math.max(Math.ceil(total / limit), 1),
        limit,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      throw error;
    }
  }

  // GET SINGLE
  async findOne(id: string) {
    try {
      const category = await this.categoryModel.findById(id);
      if (!category) {
        return { message: 'Category not found' };
      }
      return category;
    } catch (error) {
      throw error;
    }
  }

  // UPDATE
  async update(id: string, dto: UpdateCategoryDto, images?: string[]) {
    try {
      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        { ...dto, ...(images && { images }) },
        { new: true },
      );
      if (!updatedCategory) {
        return { message: 'Category not found' };
      }
      const recipientEmail = await this.getCategoryUserEmail(updatedCategory.userId);
      await this.mailService.sendCategoryNotification('update', updatedCategory, recipientEmail, images);
      return updatedCategory;
    } catch (error) {
      throw error;
    }
  }

  // DELETE
  async delete(id: string) {
    try {
      const deletedCategory = await this.categoryModel.findByIdAndDelete(id);
      if (!deletedCategory) {
        return { message: 'Category not found' };
      }
      const recipientEmail = await this.getCategoryUserEmail(deletedCategory.userId);
      await this.mailService.sendCategoryNotification('delete', deletedCategory, recipientEmail);
      return {
        message: `${deletedCategory.name} removed successfully`,
      };
    } catch (error) {
      throw error;
    }
  }
}