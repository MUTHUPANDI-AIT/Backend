import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product } from '../products/schemas/product.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async getDashboard(userId: string) {
    // Get user details
    const user = await this.userModel.findById(userId).populate('role');

    // Get product stats
    const totalProducts = await this.productModel.countDocuments();
    const userProducts = await this.productModel.countDocuments({ createdBy: userId });

    // Get recent products
    const recentProducts = await this.productModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role ? (user.role as any).name : null,
      },
      stats: {
        totalProducts,
        userProducts,
      },
      recentProducts,
    };
  }
}
