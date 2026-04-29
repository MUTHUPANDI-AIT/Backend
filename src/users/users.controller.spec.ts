import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

/* ------------------ MOCK SERVICE ------------------ */

const mockUsersService = {
  register: jest.fn() as jest.MockedFunction<UsersService['register']>,
  login: jest.fn() as jest.MockedFunction<UsersService['login']>,
};

/* ------------------ TEST SUITE ------------------ */

describe('UsersController', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* ------------------ REGISTER ------------------ */

  describe('register', () => {
    it('should call usersService.register and return response', async () => {
      const dto: CreateUserDto = {
        email: 'test@test.com',
        password: '123456',
        name: 'Test User',
      };

      const response = {
        message: 'User registered successfully',
        token: 'jwt-token',
        role: 'USER',
      };

      service.register.mockResolvedValue(response);

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });

    it('should propagate service error', async () => {
      const dto: CreateUserDto = {
        email: 'test@test.com',
        password: '123456',
        name: 'Test User',
      };

      service.register.mockRejectedValue(new Error('Registration failed'));

      await expect(controller.register(dto)).rejects.toThrow(
        'Registration failed',
      );
    });
  });

  /* ------------------ LOGIN ------------------ */

  describe('login', () => {
    it('should call usersService.login and return response', async () => {
      const dto: LoginUserDto = {
        email: 'test@test.com',
        password: '123456',
      };

      const response = {
        message: 'Login successful',
        token: 'jwt-token',
        role: 'USER',
      };

      service.login.mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });

    it('should propagate service error', async () => {
      const dto: LoginUserDto = {
        email: 'test@test.com',
        password: '123456',
      };

      service.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(dto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
