import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { JWT_CONSTANTS } from '../users/constants/user.constants';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from '../users/auth.guard';
import { RolesGuard } from '../users/roles.guard';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
    JwtModule.register({
      secret: JWT_CONSTANTS.SECRET,
      signOptions: { expiresIn: JWT_CONSTANTS.EXPIRES_IN },
    }),
    UsersModule,
    CommonModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, AuthGuard, RolesGuard],
  // Export JwtModule if needed
})
export class ProductsModule {}