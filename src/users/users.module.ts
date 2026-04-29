import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';

import { JWT_CONSTANTS } from './constants/user.constants';
import { SeedService } from './seeds/seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    JwtModule.register({
      secret: JWT_CONSTANTS.SECRET,
      signOptions: { expiresIn: JWT_CONSTANTS.EXPIRES_IN },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, SeedService], // ✅ FIXED
  exports: [UsersService],
})
export class UsersModule {}
