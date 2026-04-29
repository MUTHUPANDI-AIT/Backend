// products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
  Req,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Auth } from '../users/auth.decorator'; // Import your custom decorator
import { UserRole } from '../users/schemas/user.schema';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  // CREATE: Restricted to ADMIN or EMPLOYEE
  @Post()
  @Auth(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const images = files?.map((f) => f.path);
    const userId = req.user._id.toString();
    return this.service.create(images, dto, userId);
  }

  // READ ALL: Only requires a valid login
  @Get()
  @Auth()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // READ ONE: Only requires a valid login
  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // UPDATE: Restricted to ADMIN or EMPLOYEE
  @Put(':id')
  @Auth(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UpdateProductDto,
  ) {
    const images = files?.map((f) => f.path);
    return this.service.update(id, dto, images);
  }


  @Delete(':id')
  @Auth(UserRole.ADMIN , UserRole.EMPLOYEE)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}