import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { JwtModule } from '@nestjs/jwt';
import { JWT_CONSTANTS } from '../users/constants/user.constants';
import { UsersService } from '../users/users.service';
import { Role, RoleSchema } from '../users/schemas/role.schema';
import { AuthGuard } from '../users/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    JwtModule.register({
      secret: JWT_CONSTANTS.SECRET,
      signOptions: { expiresIn: JWT_CONSTANTS.EXPIRES_IN },
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, UsersService, AuthGuard],
})
export class DashboardModule {}
