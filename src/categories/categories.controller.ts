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
  UseGuards,
  Req,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from '../users/auth.guard';
import { Roles } from '../users/roles.decorator';
import { RolesGuard } from '../users/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

interface CategoryQuery {
  name?: string;
  startDate?: string;
  endDate?: string;
  page?: string | number;
  limit?: string | number;
}

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  // CREATE (multiple images)
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
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
    @Body() dto: CreateCategoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const images = files?.map((f) => f.path);
    const userId = req.user._id.toString();
    return this.service.create(images, dto, userId);
  }

  // GET ALL + FILTERS
  @Get()
  findAll(@Query() query: CategoryQuery) {
    return this.service.findAll(query);
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // UPDATE
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
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
    @Body() dto: UpdateCategoryDto,
  ) {
    const images = files?.map((f) => f.path);
    return this.service.update(id, dto, images);
  }

  // DELETE
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
