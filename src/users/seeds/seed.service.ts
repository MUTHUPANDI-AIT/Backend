// seed.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Role } from '../schemas/role.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import {
  Product,
  ProductDocument,
} from '../../products/schemas/product.schema';
import { seedRoles } from './roles.seed';
import { usersSeed } from './users.seed';
import { productsSeed } from '../../products/seeds/products.seed';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  // ✅ Removed OnModuleInit. This is now a standard method.
  async runSeed(targets: string[] = ['all']) {
    const requested = new Set(targets.map((target) => target.toLowerCase()));

    if (requested.has('all') || requested.has('roles')) {
      await seedRoles(this.roleModel);
      console.log('✅ Roles seeded successfully');
    }

    if (requested.has('all') || requested.has('users')) {
      await this.seedUsers();
      console.log('✅ Users seeded successfully');
    }

    if (requested.has('all') || requested.has('products')) {
      await this.seedProducts();
      console.log('✅ Products seeded successfully');
    }
  }

  private async seedUsers() {
    await seedRoles(this.roleModel);

    const roles = await this.roleModel.find();
    const roleByName = new Map(roles.map((role) => [role.name, role._id]));

    for (const user of usersSeed) {
      const roleId = roleByName.get(user.role) ?? roleByName.get(UserRole.USER);
      await this.userModel.updateOne(
        { email: user.email },
        {
          $setOnInsert: {
            ...user,
            role: roleId,
          },
        },
        { upsert: true },
      );
    }
  }

  private async seedProducts() {
    await this.seedUsersIfEmpty();

    const adminUser = await this.userModel.findOne({
      email: 'admin@example.com',
    });
    const fallbackUser = await this.userModel.findOne();
    const userId = adminUser?._id.toString() ?? fallbackUser?._id.toString();

    if (!userId) {
      throw new Error(
        'Unable to seed products because no user exists. Run roles and users seed first.',
      );
    }

    for (const product of productsSeed) {
      await this.productModel.updateOne(
        { name: product.name },
        {
          $setOnInsert: {
            ...product,
            userId,
          },
        },
        { upsert: true },
      );
    }
  }

  private async seedUsersIfEmpty() {
    const count = await this.userModel.countDocuments();
    if (count === 0) {
      await this.seedUsers();
    }
  }
}
