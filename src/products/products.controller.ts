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
  Res,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';

import { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Auth } from '../users/auth.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

interface ProductQuery {
  name?: string;
  stock?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}

// ✅ MEMORY STORAGE UPLOADS FOR DB-SAVED IMAGES
const multerConfig = {
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @Auth(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const images = files?.map((file) => {
      if (!file.buffer) {
        throw new BadRequestException('Uploaded file is missing binary data');
      }

      return {
        filename: file.originalname,
        mimetype: file.mimetype,
        data: file.buffer,
      };
    });

    const userId = req.user._id.toString();
    return this.service.create(images, dto, userId);
  }

  @Get()
  findAll(@Query() query: ProductQuery) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/images/:index')
  async getImage(
    @Param('id') id: string,
    @Param('index') index: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const image = await this.service.getImage(id, Number(index));
    res.setHeader('Content-Type', image.mimetype);
    return new StreamableFile(image.data);
  }

  @Put(':id')
  @Auth(UserRole.ADMIN, UserRole.EMPLOYEE)
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UpdateProductDto,
  ) {
    const images = files?.map((file) => {
      if (!file.buffer) {
        throw new BadRequestException('Uploaded file is missing binary data');
      }

      return {
        filename: file.originalname,
        mimetype: file.mimetype,
        data: file.buffer,
      };
    });

    return this.service.update(id, dto, images);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN, UserRole.EMPLOYEE)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
