import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { Readable } from 'stream';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '../users/auth.guard';
import { RolesGuard } from '../users/roles.guard';
import { Request } from 'express';

/* ------------------ TYPES ------------------ */

type MockRequest = Request & {
  user: {
    _id: string;
    email: string;
    role: string;
  };
};

/* ------------------ MOCK SERVICE ------------------ */
stream: new Readable();

const mockProductsService: {
  create: jest.MockedFunction<ProductsService['create']>;
  findAll: jest.MockedFunction<ProductsService['findAll']>;
  findOne: jest.MockedFunction<ProductsService['findOne']>;
  update: jest.MockedFunction<ProductsService['update']>;
  delete: jest.MockedFunction<ProductsService['delete']>;
} = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

/* ------------------ TEST SUITE ------------------ */

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* ------------------ CREATE ------------------ */

  describe('create', () => {
    it('should create product successfully with files', async () => {
      const files: Express.Multer.File[] = [
        {
          fieldname: 'images',
          originalname: 'img1.png',
          encoding: '7bit',
          mimetype: 'image/png',
          size: 123,
          destination: '',
          filename: '',
          path: 'uploads/img1.png',
          buffer: Buffer.from(''),
          stream: new Readable(),
        },
      ];

      const dto: CreateProductDto = {
        name: 'Product1',
        description: 'Desc',
        price: 10.99,
        stock: 5,
        category: 'cat1',
      };

      const req: MockRequest = {
        user: {
          _id: 'user123',
          email: 'test@test.com',
          role: 'ADMIN',
        },
      } as MockRequest;

      const expected = { id: '1', ...dto };

      mockProductsService.create.mockResolvedValue(expected as never);

      const result = await controller.create(files, dto, req);

      expect(mockProductsService.create).toHaveBeenCalledWith(
        [
          {
            filename: 'img1.png',
            mimetype: 'image/png',
            data: Buffer.from(''),
          },
        ],
        dto,
        'user123',
      );

      expect(result).toEqual(expected);
    });

    it('should handle service error', async () => {
      const files: Express.Multer.File[] = [];

      const dto: CreateProductDto = {
        name: 'Product3',
        description: 'Desc',
        price: 10,
        stock: 1,
        category: 'cat1',
      };

      const req: MockRequest = {
        user: {
          _id: 'user789',
          email: 'test@test.com',
          role: 'ADMIN',
        },
      } as MockRequest;

      mockProductsService.create.mockRejectedValue(
        new BadRequestException('Invalid data'),
      );

      await expect(controller.create(files, dto, req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  /* ------------------ FIND ALL ------------------ */

  describe('findAll', () => {
    it('should return all products with query', async () => {
      const query = { category: 'electronics', limit: '10' };
      const products = [{ id: '1', name: 'Product1' }];

      mockProductsService.findAll.mockResolvedValue(products as never);

      const result = await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(products);
    });

    it('should handle service error', async () => {
      mockProductsService.findAll.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.findAll({})).rejects.toThrow('Database error');
    });
  });

  /* ------------------ FIND ONE ------------------ */

  describe('findOne', () => {
    it('should return one product', async () => {
      const product = { id: '1', name: 'Product1' };

      mockProductsService.findOne.mockResolvedValue(product as never);

      const result = await controller.findOne('1');

      expect(mockProductsService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(product);
    });

    it('should handle not found', async () => {
      mockProductsService.findOne.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* ------------------ UPDATE ------------------ */

  describe('update', () => {
    it('should update product with files', async () => {
      const files: Express.Multer.File[] = [
        {
          fieldname: 'images',
          originalname: 'img2.png',
          encoding: '7bit',
          mimetype: 'image/png',
          size: 123,
          destination: '',
          filename: '',
          path: 'uploads/img2.png',
          buffer: Buffer.from(''),
          stream: new Readable(),
        },
      ];

      const dto: UpdateProductDto = { name: 'Updated Product' };
      const updatedProduct = { id: '1', ...dto };

      mockProductsService.update.mockResolvedValue(updatedProduct as never);

      const result = await controller.update('1', files, dto);

      expect(mockProductsService.update).toHaveBeenCalledWith('1', dto, [
        {
          filename: 'img2.png',
          mimetype: 'image/png',
          data: Buffer.from(''),
        },
      ]);

      expect(result).toEqual(updatedProduct);
    });

    it('should handle update error', async () => {
      mockProductsService.update.mockRejectedValue(
        new BadRequestException('Invalid update'),
      );

      await expect(controller.update('1', [], { name: '' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  /* ------------------ DELETE ------------------ */

  describe('delete', () => {
    it('should delete product', async () => {
      const response = { message: 'Deleted' };

      mockProductsService.delete.mockResolvedValue(response as never);

      const result = await controller.delete('1');

      expect(mockProductsService.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(response);
    });

    it('should handle delete error', async () => {
      mockProductsService.delete.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});
